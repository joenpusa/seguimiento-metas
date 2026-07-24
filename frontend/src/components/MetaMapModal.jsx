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
  const { metaMunicipiosVigencias, municipioNombresAsociados } = useMemo(() => {
    if (!targetMeta || !targetMeta.municipios || !Array.isArray(targetMeta.municipios)) {
      return { metaMunicipiosVigencias: new Map(), municipioNombresAsociados: [] };
    }

    const selectedIds = new Set(
      targetMeta.municipios.map((m) =>
        typeof m === "object" ? m.id || m.id_municipio : m
      )
    );

    const codigosVigencias = new Map();
    const nombres = [];
    let todoElDepartamento = false;

    municipios.forEach((muni) => {
      const isSelected = selectedIds.has(muni.id);
      
      let mv = null;
      if (Array.isArray(targetMeta.municipios_vigencias)) {
        mv = targetMeta.municipios_vigencias.find((v) => v.id_municipio === muni.id);
      }

      if (isSelected || mv) {
        if (muni.nombre && muni.nombre.toLowerCase().includes("todo el departamento")) {
          todoElDepartamento = true;
        }
        
        if (isSelected) nombres.push(muni.nombre);

        const vigenciasCount = mv ? mv.vigencias : 0;

        if (muni.codigo) {
          const str = String(muni.codigo).trim();
          const fullCode = str.startsWith("54") ? str : "54" + str.padStart(3, "0");

          codigosVigencias.set(fullCode, vigenciasCount);
          codigosVigencias.set(str, vigenciasCount);
        }
      }
    });

    if (todoElDepartamento) {
      norteSantanderGeoJson.features.forEach((feature) => {
        if (feature.properties?.id) {
          const code = String(feature.properties.id);
          if (!codigosVigencias.has(code)) {
            codigosVigencias.set(code, 0);
          }
        }
      });
    }

    return {
      metaMunicipiosVigencias: codigosVigencias,
      municipioNombresAsociados: nombres,
    };
  }, [targetMeta, municipios]);

  // Estilo dinámico para los polígonos del GeoJSON
  const mapStyle = (feature) => {
    const featureId = feature.properties?.id?.toString();
    const vigencias = metaMunicipiosVigencias.has(featureId) ? metaMunicipiosVigencias.get(featureId) : -1;

    let fillColor = "#ffffff";
    let weight = 1;
    let color = "#cbd5e1";
    let fillOpacity = 0.5;

    if (vigencias === 0) {
      fillColor = "#f1f5f9";
      color = "#94a3b8";
    } else if (vigencias === 1) {
      fillColor = "#bae6fd";
      color = "#0284c7";
      fillOpacity = 0.8;
      weight = 2;
    } else if (vigencias === 2) {
      fillColor = "#38bdf8";
      color = "#0369a1";
      fillOpacity = 0.8;
      weight = 2;
    } else if (vigencias === 3) {
      fillColor = "#0284c7";
      color = "#075985";
      fillOpacity = 0.8;
      weight = 2;
    } else if (vigencias >= 4) {
      fillColor = "#0c4a6e";
      color = "#082f49";
      fillOpacity = 0.8;
      weight = 2;
    }

    return { fillColor, weight, opacity: 1, color, fillOpacity };
  };

  // Hover e interacciones en cada polígono
  const onEachFeature = (feature, layer) => {
    const featureId = feature.properties?.id?.toString();
    const vigencias = metaMunicipiosVigencias.has(featureId) ? metaMunicipiosVigencias.get(featureId) : -1;

    if (feature.properties && feature.properties.name) {
      let statusText = "";
      if (vigencias >= 0) {
        statusText = vigencias === 0 ? " (Sin avances)" : ` (${vigencias} vigencia${vigencias > 1 ? "s" : ""})`;
      }
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
          fillOpacity: vigencias > 0 ? 0.95 : 0.6,
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
        <div className="flex flex-wrap items-center gap-4 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-md border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-400 inline-block" />
            <span className="text-muted-foreground">Sin vigencias</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-sky-200 border border-sky-600 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-200">1 vigencia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-sky-400 border border-sky-700 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-200">2 vigencias</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-sky-600 border border-sky-800 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-200">3 vigencias</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-sky-900 border border-sky-950 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-200">4 vigencias</span>
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
              key={Array.from(metaMunicipiosVigencias.keys()).join("-")}
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
