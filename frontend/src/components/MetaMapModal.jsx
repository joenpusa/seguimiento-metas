import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import norteSantanderGeoJson from "@/utils/norte_santander.json";
import { useMunicipio } from "@/context/MunicipioContext";
import { useMeta } from "@/context/MetaContext";
import { Badge } from "@/components/ui/badge";

const MetaMapModal = ({ open, onOpenChange, meta }) => {
  const { municipios } = useMunicipio();
  const { fetchMetaById } = useMeta();
  const [currentMeta, setCurrentMeta] = useState(meta);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && meta?.id) {
      setLoading(true);
      fetchMetaById(meta.id).then((metaDetail) => {
        if (metaDetail) {
          setCurrentMeta(metaDetail);
        } else {
          setCurrentMeta(meta);
        }
        setLoading(false);
      });
    } else if (!open) {
      setCurrentMeta(null);
    }
  }, [open, meta?.id, fetchMetaById]);

  const targetMeta = currentMeta || meta;

  // Obtener los códigos combinados de dep (54) + municipio para los municipios asociados a esta meta
  const { metaMunicipiosCodigos, municipioNombresAsociados } = useMemo(() => {
    if (!targetMeta || !targetMeta.municipios || !Array.isArray(targetMeta.municipios)) {
      return { metaMunicipiosCodigos: new Set(), municipioNombresAsociados: [] };
    }

    const selectedIds = new Set(
      targetMeta.municipios.map((m) =>
        typeof m === "object" ? m.id || m.id_municipio : m
      )
    );

    const codigos = new Set();
    const nombres = [];
    let todoElDepartamento = false;

    municipios.forEach((muni) => {
      if (selectedIds.has(muni.id)) {
        if (muni.nombre && muni.nombre.toLowerCase().includes("todo el departamento")) {
          todoElDepartamento = true;
        }
        nombres.push(muni.nombre);

        if (muni.codigo) {
          const str = String(muni.codigo).trim();
          // Combinación entre código del departamento (54) y código del municipio
          const fullCode = str.startsWith("54")
            ? str
            : "54" + str.padStart(3, "0");

          codigos.add(fullCode);
          codigos.add(str);
        }
      }
    });

    if (todoElDepartamento) {
      norteSantanderGeoJson.features.forEach((feature) => {
        if (feature.properties?.id) {
          codigos.add(String(feature.properties.id));
        }
      });
    }

    return {
      metaMunicipiosCodigos: codigos,
      municipioNombresAsociados: nombres,
    };
  }, [targetMeta, municipios]);

  // Estilo dinámico para los polígonos del GeoJSON
  const mapStyle = (feature) => {
    const featureId = feature.properties?.id?.toString();
    const isHighlighted = metaMunicipiosCodigos.has(featureId);

    return {
      fillColor: isHighlighted ? "#2563eb" : "#f1f5f9",
      weight: isHighlighted ? 2 : 1,
      opacity: 1,
      color: isHighlighted ? "#1d4ed8" : "#94a3b8",
      fillOpacity: isHighlighted ? 0.8 : 0.4,
    };
  };

  // Hover e interacciones en cada polígono
  const onEachFeature = (feature, layer) => {
    const featureId = feature.properties?.id?.toString();
    const isHighlighted = metaMunicipiosCodigos.has(featureId);

    if (feature.properties && feature.properties.name) {
      const statusText = isHighlighted ? " (Asociado)" : "";
      layer.bindTooltip(`${feature.properties.name}${statusText}`, {
        sticky: true,
        direction: "top",
        className:
          "text-xs font-semibold px-2 py-1 bg-slate-900 text-white rounded shadow-md border-0",
      });
    }

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: "#0f172a",
          fillOpacity: isHighlighted ? 0.95 : 0.6,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(mapStyle(feature));
      },
    });
  };

  if (!meta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <span>Municipios Asociados: Meta {targetMeta?.codigo || meta.codigo}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {targetMeta?.nombre || meta.nombre}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {municipioNombresAsociados.length > 0
                ? `${municipioNombresAsociados.length} Municipio(s)`
                : "Sin municipios asignados"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Leyenda */}
        <div className="flex items-center gap-6 text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-600 border border-blue-700 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Municipio relacionado con la meta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-400 inline-block" />
            <span className="text-muted-foreground">Municipio no seleccionado</span>
          </div>
        </div>

        {/* Contenedor del Mapa */}
        <div className="flex-1 w-full rounded-lg overflow-hidden border bg-slate-50 dark:bg-slate-950 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 z-10 flex items-center justify-center text-sm text-slate-500 font-medium">
              Cargando información geográfica de la meta...
            </div>
          )}
          <MapContainer
            center={[7.9, -72.8]}
            zoom={8}
            style={{ height: "100%", width: "100%", background: "#f8fafc" }}
            scrollWheelZoom={true}
          >
            <GeoJSON
              key={Array.from(metaMunicipiosCodigos).join("-")}
              data={norteSantanderGeoJson}
              style={mapStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetaMapModal;
