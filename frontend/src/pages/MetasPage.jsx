import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MetaCard from '@/components/MetaCard';
import MetasFilterControls from '@/components/MetasFilterControls';
import { useMetas } from '@/context/MetasContext';
import { usePlan } from '@/context/PlanContext';
import { useAuth } from '@/context/AuthContext';
import { List, Grid, Plus } from 'lucide-react';

const MetasPage = () => {
  const { metas: todasLasMetas, loading } = useMetas();
  const { getActivePlan, listaResponsables, listaMunicipios } = usePlan();
  const { currentUser } = useAuth();
  
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    responsable: '',
    municipio: '',
    estadoProgreso: '', 
  });

  const activePlan = getActivePlan();

  const metasVisibles = useMemo(() => {
    if (!currentUser || currentUser.rol === 'admin') {
      return todasLasMetas;
    }
    if (currentUser.rol === 'responsable') {
      return todasLasMetas.filter(meta => meta.responsable === currentUser.nombre);
    }
    return [];
  }, [todasLasMetas, currentUser]);


  const filteredMetas = useMemo(() => {
    return metasVisibles.filter(meta => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        meta.nombreMeta.toLowerCase().includes(searchLower) ||
        meta.descripcionMeta.toLowerCase().includes(searchLower) ||
        (meta.numeroMetaManual && meta.numeroMetaManual.toLowerCase().includes(searchLower));

      const matchesResponsable = filters.responsable ? meta.responsable === filters.responsable : true;
      const matchesMunicipio = filters.municipio 
        ? meta.municipios.includes(filters.municipio) || (filters.municipio === "Todo el departamento" && meta.municipios.includes("Todo el departamento"))
        : true;

      const progreso = meta.progreso || 0;
      let matchesEstadoProgreso = true;
      if (filters.estadoProgreso) {
        switch (filters.estadoProgreso) {
          case 'sinIniciar': matchesEstadoProgreso = progreso === 0; break;
          case 'enProgreso': matchesEstadoProgreso = progreso > 0 && progreso < 100; break;
          case 'completada': matchesEstadoProgreso = progreso === 100; break;
          default: break;
        }
      }
      
      return matchesSearch && matchesResponsable && matchesMunicipio && matchesEstadoProgreso;
    }).sort((a,b) => (a.numeroMetaManual || a.nombreMeta).localeCompare(b.numeroMetaManual || b.nombreMeta));
  }, [metasVisibles, searchTerm, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando metas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Metas del Plan: {activePlan ? activePlan.nombrePlan : "N/A"}
          </h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona las metas. 
            {currentUser && currentUser.rol === 'responsable' && ` Solo metas de: ${currentUser.nombre}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'list' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <MetasFilterControls 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        listaResponsables={listaResponsables}
        listaMunicipios={listaMunicipios}
        currentUser={currentUser}
      />

      {filteredMetas.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10"
        >
          <img-replace src="/no-results.svg" alt="No hay metas" className="w-40 h-40 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700">No se encontraron metas</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o el término de búsqueda.</p>
           {currentUser && currentUser.rol === 'admin' && (
            <Button className="mt-4" onClick={() => { 
              document.querySelector('[href="/admin-plan"]')?.click();
              setTimeout(() => document.querySelector('button[value="estructura"]')?.click(), 100); 
            }}>
              <Plus className="mr-2 h-4 w-4" /> Ir a Crear Metas
            </Button>
           )}
        </motion.div>
      ) : (
        <motion.div 
          layout
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          <AnimatePresence>
            {filteredMetas.map(meta => (
              <motion.div
                key={meta.idMeta}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <MetaCard meta={meta} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MetasPage;