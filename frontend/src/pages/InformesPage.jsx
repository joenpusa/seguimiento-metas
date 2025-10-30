import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReportFilters from '@/components/informes/ReportFilters';
import ReportSummary from '@/components/informes/ReportSummary';
import ReportCharts from '@/components/informes/ReportCharts';
import ReportDetailsTable from '@/components/informes/ReportDetailsTable';
import { Button } from '@/components/ui/button';
import { BarChart2, PieChart } from 'lucide-react';

const InformesPage = () => {
  const { 
    activePlanId,
    getActivePlan,
    getAllMetasFromActivePlan, // Nueva función
    getAllAvancesFromActivePlan, // Nueva función
    listaMunicipios,
    listaResponsables,
    loading 
  } = usePlan();

  const [filters, setFilters] = useState({
    anio: '',
    trimestre: '',
    municipio: '',
    responsable: '',
    // showOnlyWithProgress: false // Este filtro parece no estar implementado en el useMemo
  });

  const [chartType, setChartType] = useState('bar');
  
  // Usamos estados locales para las metas y avances aplanados
  const [metasActivas, setMetasActivas] = useState([]);
  const [avancesActivos, setAvancesActivos] = useState([]);

  useEffect(() => {
    if (activePlanId && !loading) {
      setMetasActivas(getAllMetasFromActivePlan());
      setAvancesActivos(getAllAvancesFromActivePlan());
    } else {
      setMetasActivas([]);
      setAvancesActivos([]);
    }
  }, [activePlanId, loading, getAllMetasFromActivePlan, getAllAvancesFromActivePlan]);


  const filteredData = useMemo(() => {
    if (!activePlanId || !Array.isArray(metasActivas) || !Array.isArray(avancesActivos)) {
      return { filteredMetas: [], filteredAvances: [] };
    }

    let currentMetas = [...metasActivas]; // Trabajar con una copia
    let currentAvances = [...avancesActivos]; // Trabajar con una copia

    // Aplicar filtros de año y trimestre sobre los avances
    // Y luego filtrar las metas que tienen alguno de esos avances
    if (filters.anio || filters.trimestre) {
        let avancesFiltradosPorFecha = [...currentAvances];
        if (filters.anio) {
            avancesFiltradosPorFecha = avancesFiltradosPorFecha.filter(avance => 
                avance.anioAvance && avance.anioAvance.toString() === filters.anio
            );
        }
        if (filters.trimestre) {
            avancesFiltradosPorFecha = avancesFiltradosPorFecha.filter(avance => 
                avance.trimestreAvance === filters.trimestre
            );
        }
        const metaIdsConAvancesFiltrados = new Set(avancesFiltradosPorFecha.map(av => av.metaId));
        currentMetas = currentMetas.filter(meta => metaIdsConAvancesFiltrados.has(meta.idMeta));
        currentAvances = avancesFiltradosPorFecha; // Usar los avances ya filtrados por fecha
    }


    // Filtrar metas por municipio y responsable
    if (filters.municipio) {
      currentMetas = currentMetas.filter(meta => 
        Array.isArray(meta.municipios) && meta.municipios.includes(filters.municipio)
      );
    }

    if (filters.responsable) {
      currentMetas = currentMetas.filter(meta => 
        meta.responsable === filters.responsable
      );
    }
    
    // Si se filtraron metas por municipio o responsable, asegurar que los avances correspondan a esas metas
    if (filters.municipio || filters.responsable) {
        const metaIdsFiltradasPorPropiedades = new Set(currentMetas.map(m => m.idMeta));
        currentAvances = currentAvances.filter(avance => metaIdsFiltradasPorPropiedades.has(avance.metaId));
    }


    // if (filters.showOnlyWithProgress) { // Este filtro no está en el estado filters
    //   const metasConAvance = new Set(currentAvances.map(avance => avance.metaId));
    //   currentMetas = currentMetas.filter(meta => metasConAvance.has(meta.idMeta));
    // }

    return { filteredMetas: currentMetas, filteredAvances: currentAvances };
  }, [metasActivas, avancesActivos, activePlanId, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const activePlan = getActivePlan();

  if (loading && !activePlanId) { // Mostrar loading solo si no hay plan activo y se está cargando
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activePlanId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay un plan activo seleccionado. Por favor, active o cree un plan en la sección de Administración.
        </p>
      </div>
    );
  }
  
  if (loading) { // Si hay plan activo pero aun cargando algo (menos probable ahora)
     return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Informes y Reportes</h1>
            <p className="text-muted-foreground">
              Análisis y seguimiento del plan: {activePlan?.nombrePlan || 'Cargando nombre...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('bar')}
              className="text-xs"
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
              Barras
            </Button>
            <Button 
              variant={chartType === 'pie' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('pie')}
              className="text-xs"
            >
              <PieChart className="h-3.5 w-3.5 mr-1.5" />
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
            municipios={listaMunicipios || []}
            responsables={listaResponsables || []}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportSummary data={filteredData} chartType={chartType} />
        <ReportCharts 
          metasFiltradas={filteredData.filteredMetas || []} 
          filters={filters} 
          chartType={chartType} 
        />
        <ReportDetailsTable metasFiltradas={filteredData.filteredMetas || []} />
      </div>
    </div>
  );
};

export default InformesPage;