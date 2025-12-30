import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Hash,
  TrendingUp,
} from "lucide-react";

/* =========================
   TOOLTIP
========================= */
const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>

      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 -mt-1 text-xs leading-tight text-white transform -translate-x-1/2 bg-black rounded-lg shadow-lg left-1/2 bottom-full">
          {text}
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENTE PRINCIPAL
========================= */
const DashboardTable = ({ metas = [] }) => {
  /* =========================
     FILTRO Y ORDEN
  ========================== */
  const metasFiltradasYOrdenadas = metas
    .filter(
      (meta) =>
        meta.estadoProgreso !== "SIN_INICIAR" &&
        (meta.porcentajeFisico || 0) >= 60
    )
    .sort(
      (a, b) =>
        (b.porcentajeFisico || 0) -
        (a.porcentajeFisico || 0)
    );

  /* =========================
     HELPERS
  ========================== */
  const getStatusIcon = (estado) => {
    if (estado === "SIN_INICIAR")
      return <Clock className="h-4 w-4 text-gray-400" />;

    if (estado === "EN_EJECUCION")
      return <TrendingUp className="h-4 w-4 text-yellow-500" />;

    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getProgressColor = (valor) => {
    if (valor < 30) return "bg-red-500";
    if (valor < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Metas Destacadas (Avance ≥ 60%)
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">
                    Nº Meta
                  </th>
                  {/* <th className="py-3 px-4 text-left font-medium">
                    Municipio(s)
                  </th> */}
                  <th className="py-3 px-4 text-left font-medium">
                    Avance
                  </th>
                  <th className="py-3 px-4 text-left font-medium">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {metasFiltradasYOrdenadas
                  .slice(0, 5)
                  .map((meta) => (
                    <tr
                      key={meta.id}
                      className="border-b hover:bg-gray-50"
                    >
                      {/* META */}
                      <td className="py-3 px-4">
                        <Tooltip text={meta.nombre}>
                          <div className="flex items-center gap-1 text-xs cursor-default">
                            <Hash className="h-3 w-3 text-gray-400" />
                            {meta.codigo || "N/A"} - {meta.nombre}
                          </div>
                        </Tooltip>
                      </td>

                      {/* MUNICIPIOS */}
                      {/* <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {Array.isArray(meta.municipios)
                            ? meta.municipios.join(", ")
                            : "N/A"}
                        </div>
                      </td> */}

                      {/* PROGRESO */}
                      <td className="py-3 px-4 w-[160px]">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={meta.porcentajeFisico || 0}
                            className="h-2 flex-1"
                            indicatorClassName={getProgressColor(
                              meta.porcentajeFisico || 0
                            )}
                          />
                          <span className="text-xs font-medium">
                            {meta.porcentajeFisico || 0}%
                          </span>
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(meta.estadoProgreso)}
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* EMPTY STATE */}
                {metasFiltradasYOrdenadas.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-gray-500"
                    >
                      No hay metas destacadas con avance ≥ 60%.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardTable;
