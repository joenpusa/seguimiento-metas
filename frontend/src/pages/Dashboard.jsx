import React from "react";
import { motion } from "framer-motion";
import { useMeta } from "@/context/MetaContext";
import DashboardStats from "@/components/DashboardStats";
import DashboardChart from "@/components/DashboardChart";
import DashboardTable from "@/components/DashboardTable";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const { metas, loading } = useMeta();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-500">
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     MÉTRICAS GENERALES
  ========================== */
  const promedioAvanceFisico =
    metas.length > 0
      ? Math.round(
        metas.reduce(
          (acc, meta) =>
            acc + (meta.porcentajeFisico || 0),
          0
        ) / metas.length
      )
      : 0;

  const promedioAvanceFinanciero =
    metas.length > 0
      ? Math.round(
        metas.reduce(
          (acc, meta) =>
            acc + (meta.porcentajeFinanciero || 0),
          0
        ) / metas.length
      )
      : 0;

  const metasCompletadas = metas.filter(
    (meta) => meta.estadoProgreso === "COMPLETADA"
  ).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Seguimiento al avance de metas del Plan de
          Desarrollo Departamental
        </p>
      </motion.div>

      {/* 📊 KPIs */}
      <DashboardStats metas={metas} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart metas={metas} />
        <DashboardTable metas={metas} />
      </div>

      {/* 🧾 RESUMEN EJECUTIVO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="gradient-bg text-white">
          <CardHeader>
            <CardTitle className="text-xl">
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 space-y-2">
              <p>
                El Plan de Desarrollo Departamental
                muestra un avance físico promedio del{" "}
                <strong>
                  {promedioAvanceFisico}%
                </strong>{" "}
                y un avance financiero promedio del{" "}
                <strong>
                  {promedioAvanceFinanciero}%
                </strong>
                .
              </p>

              <p>
                Se han completado{" "}
                <strong>{metasCompletadas}</strong>{" "}
                metas de un total de{" "}
                <strong>{metas.length}</strong>.
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {metas
                .slice()
                .sort((a, b) => {
                  const codeA = String(a.codigo || "");
                  const codeB = String(b.codigo || "");
                  return codeA.localeCompare(codeB, undefined, {
                    numeric: true,
                  });
                })
                .map((meta) => (
                  <div
                    key={meta.id}
                    className="p-3 bg-white/10 rounded-md"
                  >
                    <h4 className="font-semibold text-sm mb-1">
                      {meta.numeroMetaManual
                        ? `(${meta.numeroMetaManual}) `
                        : ""}
                      {meta.codigo} - {meta.nombre}
                    </h4>

                    <div className="space-y-1.5">
                      {/* AVANCE FÍSICO */}
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span>Avance Físico</span>
                          <span>
                            ({meta.acumuladoFisico} {meta.unidad_nombre}) {meta.porcentajeFisico || 0}%
                          </span>
                        </div>
                        <Progress
                          value={meta.porcentajeFisico || 0}
                          className="h-1.5 bg-white/30 [&>div]:bg-sky-400"
                        />
                      </div>

                      {/* AVANCE FINANCIERO */}
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span>
                            Avance Financiero
                          </span>
                          <span>
                            {meta.porcentajeFinanciero ||
                              0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            meta.porcentajeFinanciero ||
                            0
                          }
                          className="h-1.5 bg-white/30 [&>div]:bg-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {metas.length === 0 && (
              <p className="text-center py-4">
                No hay metas para mostrar.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
