import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const DashboardStats = ({ metas }) => {
  /* =========================
     MÉTRICAS BASE
  ========================== */
  const totalMetas = metas.length;

  const metasCompletadas = metas.filter(
    (meta) => meta.estadoProgreso === "COMPLETADA"
  ).length;

  const metasEnEjecucion = metas.filter(
    (meta) => meta.estadoProgreso === "EN_EJECUCION"
  );

  const metasSinIniciar = metas.filter(
    (meta) => meta.estadoProgreso === "SIN_INICIAR"
  ).length;

  const metasEnRiesgo = metasEnEjecucion.filter(
    (meta) => (meta.porcentajeFisico || 0) < 30
  ).length;

  /* =========================
     PROMEDIO (excluye SIN_INICIAR)
  ========================== */
  const metasConAvance = metas.filter(
    (meta) => (meta.porcentajeFisico || 0) > 0
  );

  const promedioAvance =
    metasConAvance.length > 0
      ? Math.round(
          metasConAvance.reduce(
            (acc, meta) => acc + meta.porcentajeFisico,
            0
          ) / metasConAvance.length
        )
      : 0;

  /* =========================
     TARJETAS
  ========================== */
  const stats = [
    {
      title: "Total Metas",
      value: totalMetas,
      icon: Target,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "Promedio Avance",
      value: `${promedioAvance}%`,
      icon: TrendingUp,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
    },
    {
      title: "En Riesgo",
      value: metasEnRiesgo,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    {
      title: "Sin iniciar",
      value: metasSinIniciar,
      icon: AlertCircle,
      color: "bg-gray-400",
      textColor: "text-gray-500",
    },
    {
      title: "Completadas",
      value: metasCompletadas,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
          }}
          whileHover={{ y: -5 }}
          className="rounded-lg shadow-md overflow-hidden bg-white"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>

              <div
                className={`p-3 rounded-full ${stat.color} bg-opacity-10`}
              >
                <stat.icon
                  className={`h-6 w-6 ${stat.textColor}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
