import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { usePlan } from "@/context/PlanContext";
import { useMeta } from "@/context/MetaContext";
import { useAvance } from "@/context/AvanceContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, PieChart } from "lucide-react";

import ReportFilters from "@/components/informes/ReportFilters";
import ReportSummary from "@/components/informes/ReportSummary";
import ReportCharts from "@/components/informes/ReportCharts";
import ReportDetailsTable from "@/components/informes/ReportDetailsTable";

import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";

const InformesPage = () => {
  const { activePlanId, getActivePlan, loading: loadingPlan } = usePlan();
  const { metas, loading: loadingMetas } = useMeta();
  const { avances, loadingAvances } = useAvance();

  const { secretarias = [], } = useSecretaria();
  const { municipios = [], } = useMunicipio();

  // console.log(municipios);
  // console.log(secretarias);
  const [filters, setFilters] = useState({
    anio: "",
    trimestre: "",
    municipio: "",
    responsable: "",
  });

  const [chartType, setChartType] = useState("bar");

  const loading = loadingPlan || loadingMetas || loadingAvances;
  const activePlan = getActivePlan();

  /* ===============================
     FILTRADO CENTRAL
  =============================== */
  const filteredData = useMemo(() => {
    if (!activePlanId) {
      return { filteredMetas: [], filteredAvances: [] };
    }

    let metasFiltradas = [...metas];
    let avancesFiltrados = [...avances];

    // 📆 Filtro por año
    if (filters.anio) {
      avancesFiltrados = avancesFiltrados.filter(
        (a) => a.anio?.toString() === filters.anio
      );
    }

    // 📆 Filtro por trimestre
    if (filters.trimestre) {
      avancesFiltrados = avancesFiltrados.filter(
        (a) => a.trimestre === filters.trimestre
      );
    }

    // Vincular metas ↔ avances
    if (filters.anio || filters.trimestre) {
      const metaIds = new Set(avancesFiltrados.map((a) => a.idMeta));
      metasFiltradas = metasFiltradas.filter((m) => metaIds.has(m.id));
    }

    // 🌍 Municipio
    if (filters.municipio) {
      metasFiltradas = metasFiltradas.filter((m) =>
        Array.isArray(m.municipios)
          ? m.municipios?.some(
              mun => mun.id === Number(filters.municipio)
            )
          : false
      );
    }

    // 🏢 Responsable (unidad / secretaría)
    if (filters.responsable) {
      metasFiltradas = metasFiltradas.filter(
        (m) =>
          m.idSecretaria === Number(filters.responsable)
      );
    }
    // Ajustar avances finales
    const metasIdsFinales = new Set(metasFiltradas.map((m) => m.id));
    avancesFiltrados = avancesFiltrados.filter((a) =>
      metasIdsFinales.has(a.idMeta)
    );

    return {
      filteredMetas: metasFiltradas,
      filteredAvances: avancesFiltrados,
    };
  }, [activePlanId, metas, avances, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!activePlanId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay un plan activo seleccionado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Informes y Reportes</h1>
            <p className="text-muted-foreground">
              Análisis del plan: {activePlan?.nombrePlan}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === "bar" ? "default" : "outline"}
              onClick={() => setChartType("bar")}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Barras
            </Button>
            <Button
              size="sm"
              variant={chartType === "pie" ? "default" : "outline"}
              onClick={() => setChartType("pie")}
            >
              <PieChart className="h-4 w-4 mr-1" />
              Circular
            </Button>
          </div>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros del Informe</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            municipios={municipios}
            responsables={secretarias.filter(s => s.esActivo === 1)}
          />
        </CardContent>
      </Card>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportSummary data={filteredData} chartType={chartType} />

        <ReportCharts
          metasFiltradas={filteredData.filteredMetas}
          avancesFiltrados={filteredData.filteredAvances}
          filters={filters}
          chartType={chartType}
        />

        <ReportDetailsTable
          metasFiltradas={filteredData.filteredMetas}
          avancesFiltrados={filteredData.filteredAvances}
        />
      </div>
    </div>
  );
};

export default InformesPage;
