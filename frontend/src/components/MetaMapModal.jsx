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
        const anioUnico = mv ? mv.anio : null;

        if (muni.codigo) {
          const str = String(muni.codigo).trim();
          const fullCode = str.startsWith("54") ? str : "54" + str.padStart(3, "0");

          const dataMuni = { vigencias: vigenciasCount, anio: anioUnico };
          codigosVigencias.set(fullCode, dataMuni);
          codigosVigencias.set(str, dataMuni);
        }
      }
    });

    if (todoElDepartamento) {
      norteSantanderGeoJson.features.forEach((feature) => {
        if (feature.properties?.id) {
          const code = String(feature.properties.id);
          if (!codigosVigencias.has(code)) {
            codigosVigencias.set(code, { vigencias: 0, anio: null });
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
    const data = metaMunicipiosVigencias.get(featureId) || { vigencias: -1, anio: null };
    const { vigencias, anio } = typeof data === "object" && data !== null ? data : { vigencias: data, anio: null };

    let fillColor = "#ffffff";
    let weight = 1;
    let color = "#cbd5e1";
    let fillOpacity = 0.5;

    if (vigencias === 0) {
      fillColor = "#f1f5f9";
      color = "#94a3b8";
    } else if (vigencias === 1) {
      const anioStr = String(anio || "").trim();
      if (anioStr === "2024") {
        fillColor = "#fcd34d"; // amber-300
        color = "#d97706";     // amber-600
      } else if (anioStr === "2025") {
        fillColor = "#6ee7b7"; // emerald-300
        color = "#059669";     // emerald-600
      } else if (anioStr === "2026") {
        fillColor = "#c4b5fd"; // violet-300
        color = "#7c3aed";     // violet-600
      } else if (anioStr === "2027") {
        fillColor = "#fda4af"; // rose-300
        color = "#e11d48";     // rose-600
      } else {
        fillColor = "#bae6fd"; // sky-200
        color = "#0284c7";     // sky-600
      }
      fillOpacity = 0.85;
      weight = 2;
    } else if (vigencias === 2) {
      fillColor = "#38bdf8"; // sky-400
      color = "#0369a1";     // sky-700
      fillOpacity = 0.85;
      weight = 2;
    } else if (vigencias === 3) {
      fillColor = "#0284c7"; // sky-600
      color = "#075985";     // sky-800
      fillOpacity = 0.85;
      weight = 2;
    } else if (vigencias >= 4) {
      fillColor = "#0c4a6e"; // sky-900
      color = "#082f49";     // sky-950
      fillOpacity = 0.85;
      weight = 2;
    }

    return { fillColor, weight, opacity: 1, color, fillOpacity };
  };

  // Hover e interacciones en cada polígono
  const onEachFeature = (feature, layer) => {
    const featureId = feature.properties?.id?.toString();
    const data = metaMunicipiosVigencias.get(featureId) || { vigencias: -1, anio: null };
    const { vigencias, anio } = typeof data === "object" && data !== null ? data : { vigencias: data, anio: null };

    if (feature.properties && feature.properties.name) {
      let statusText = "";
      if (vigencias >= 0) {
        if (vigencias === 0) {
          statusText = " (Sin avances)";
        } else if (vigencias === 1) {
          statusText = ` (Categoría: ${anio || "1 vigencia"})`;
        } else {
          statusText = ` (Categoría: ${vigencias} vigencias)`;
        }
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
        <div className="flex flex-wrap items-center gap-3 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-md border shadow-sm">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#f1f5f9", borderColor: "#94a3b8" }}
            />
            <span className="text-muted-foreground">Sin avances</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#fcd34d", borderColor: "#d97706" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">2024</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#6ee7b7", borderColor: "#059669" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">2025</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#c4b5fd", borderColor: "#7c3aed" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#fda4af", borderColor: "#e11d48" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">2027</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#38bdf8", borderColor: "#0369a1" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">2 vigencias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#0284c7", borderColor: "#075985" }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-200">3 vigencias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded inline-block border"
              style={{ backgroundColor: "#0c4a6e", borderColor: "#082f49" }}
            />
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
