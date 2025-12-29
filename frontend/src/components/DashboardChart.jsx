import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DashboardChart = ({ metas = [] }) => {
  if (!Array.isArray(metas) || metas.length === 0) return null;

  // ===============================
  // AGRUPAR METAS POR LÍNEA
  // ===============================
  const metasPorLinea = metas.reduce((acc, meta) => {
    const lineaNombre =
      meta.linea?.nombre || "Sin línea estratégica";

    if (!acc[lineaNombre]) {
      acc[lineaNombre] = {
        name: lineaNombre,
        total: 0,
        avanceAcumulado: 0,
      };
    }

    acc[lineaNombre].total += 1;
    acc[lineaNombre].avanceAcumulado +=
      Number(meta.porcentajeFisico) || 0;

    return acc;
  }, {});

  // ===============================
  // DATA FINAL PARA RECHARTS
  // ===============================
  const chartData = Object.values(metasPorLinea).map((item) => ({
    name: item.name,
    avance:
      item.total > 0
        ? Math.round(item.avanceAcumulado / item.total)
        : 0,
  }));

  // ===============================
  // COLOR SEGÚN AVANCE
  // ===============================
  const getBarColor = (value) => {
    if (value < 30) return "#ef4444"; // rojo
    if (value < 70) return "#f59e0b"; // amarillo
    return "#22c55e"; // verde
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Avance por Línea Estratégica</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: -10,
                  bottom: 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  label={{
                    value: "Avance (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#374151",
                      fontSize: 12,
                    },
                  }}
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, "Avance promedio"]}
                  labelFormatter={(label) =>
                    `Línea estratégica: ${label}`
                  }
                />

                <Bar dataKey="avance">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.avance)}
                      className="transition-opacity hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardChart;
