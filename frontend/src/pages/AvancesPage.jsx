import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMeta } from '@/context/MetaContext';
import { usePlan } from '@/context/PlanContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AvanceForm from '@/components/AvanceForm';
import AvanceFilters from '@/components/avances/AvanceFilters';
import AvanceList from '@/components/avances/AvanceList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AvancesPage = () => {
  /* =========================
     CONTEXTOS
  ========================== */
  const { metas, loading: metasLoading } = useMeta();

  const {
    getActivePlan,
    loading: planLoading,
    registrarAvanceContext,
    updateAvanceContext,
    deleteAvanceContext,
    listaResponsables = []
  } = usePlan();

  const { currentUser } = useAuth();

  /* =========================
     ESTADOS
  ========================== */
  const [openForm, setOpenForm] = useState(false);
  const [avanceToEdit, setAvanceToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    metaId: '',
    anio: '',
    trimestre: '',
    responsableId: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avanceToDelete, setAvanceToDelete] = useState(null);

  const activePlan = getActivePlan();
  const loading = metasLoading || planLoading;

  /* =========================
     METAS VISIBLES SEGÚN ROL
  ========================== */
  const metasVisibles = useMemo(() => {
    if (!currentUser || currentUser.rol === 'admin') {
      return metas;
    }
    if (currentUser.rol === 'responsable') {
      return metas.filter(meta => meta.responsable === currentUser.nombre);
    }
    return [];
  }, [metas, currentUser]);

  /* =========================
     FLATTEN DE AVANCES
  ========================== */
  const todosLosAvancesDelPlan = useMemo(() => {
    return metasVisibles.flatMap(meta =>
      (meta.avances || []).map(avance => ({
        ...avance,
        metaNombre: meta.nombreMeta,
        metaId: meta.idMeta,
        metaUnidadMedida: meta.unidadMedida,
        metaNumero: meta.numeroMetaManual,
        metaResponsable: meta.responsable
      }))
    );
  }, [metasVisibles]);

  /* =========================
     AÑOS DISPONIBLES
  ========================== */
  const availableYears = useMemo(() => {
    const years = new Set(
      todosLosAvancesDelPlan.map(a => a.anioAvance).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [todosLosAvancesDelPlan]);

  /* =========================
     FILTRO + ORDEN
  ========================== */
  const avancesFiltradosYOrdenados = useMemo(() => {
    const filtrados = todosLosAvancesDelPlan.filter(avance => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        avance.descripcion.toLowerCase().includes(searchLower) ||
        avance.metaNombre.toLowerCase().includes(searchLower) ||
        (avance.metaNumero &&
          avance.metaNumero.toLowerCase().includes(searchLower));

      const matchesMeta = filters.metaId
        ? avance.metaId === filters.metaId
        : true;

      const matchesAnio = filters.anio
        ? avance.anioAvance === parseInt(filters.anio)
        : true;

      const matchesTrimestre = filters.trimestre
        ? avance.trimestreAvance === filters.trimestre
        : true;

      let matchesResponsable = true;
      if (currentUser?.rol === 'admin') {
        matchesResponsable = filters.responsableId
          ? avance.metaResponsable === filters.responsableId
          : true;
      } else if (currentUser?.rol === 'responsable') {
        matchesResponsable =
          avance.metaResponsable === currentUser.nombre;
      }

      return (
        matchesSearch &&
        matchesMeta &&
        matchesAnio &&
        matchesTrimestre &&
        matchesResponsable
      );
    });

    return [...filtrados].sort((a, b) => {
      const numA = a.metaNumero
        ? parseInt(a.metaNumero.replace(/\D/g, ''), 10)
        : Infinity;
      const numB = b.metaNumero
        ? parseInt(b.metaNumero.replace(/\D/g, ''), 10)
        : Infinity;

      if (numA !== numB) return numA - numB;
      if (b.anioAvance !== a.anioAvance)
        return b.anioAvance - a.anioAvance;
      if (b.trimestreAvance !== a.trimestreAvance)
        return (b.trimestreAvance || '').localeCompare(
          a.trimestreAvance || ''
        );

      return new Date(b.fecha) - new Date(a.fecha);
    });
  }, [todosLosAvancesDelPlan, searchTerm, filters, currentUser]);

  /* =========================
     HANDLERS
  ========================== */
  const handleSaveAvance = (avanceData) => {
    if (avanceToEdit) {
      updateAvanceContext(
        avanceData.metaId,
        avanceToEdit.idAvance,
        avanceData
      );
    } else {
      registrarAvanceContext(avanceData.metaId, avanceData);
    }
    setOpenForm(false);
    setAvanceToEdit(null);
  };

  const handleEditAvance = (avance) => {
    setAvanceToEdit(avance);
    setOpenForm(true);
  };

  const handleDeleteRequest = (avance) => {
    setAvanceToDelete(avance);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAvance = () => {
    if (avanceToDelete) {
      deleteAvanceContext(
        avanceToDelete.metaId,
        avanceToDelete.idAvance
      );
    }
    setShowDeleteConfirm(false);
    setAvanceToDelete(null);
  };

  /* =========================
     LOADING
  ========================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */
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
            Avances del Plan:{' '}
            {activePlan ? activePlan.nombrePlan : 'N/A'}
          </h1>
          <p className="text-muted-foreground">
            Registro y seguimiento de avances en las metas del plan
            activo.
            {currentUser?.rol === 'responsable' &&
              ` Solo metas de: ${currentUser.nombre}`}
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => {
              setAvanceToEdit(null);
              setOpenForm(true);
            }}
            className="gap-2"
            disabled={metasVisibles.length === 0}
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Avance</span>
          </Button>
          {metasVisibles.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              No hay metas asignadas para registrar avances.
            </p>
          )}
        </motion.div>
      </motion.div>

      <AvanceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        metas={metasVisibles}
        availableYears={availableYears}
        listaResponsables={listaResponsables}
        currentUser={currentUser}
      />

      <AvanceList
        avances={avancesFiltradosYOrdenados}
        loading={loading}
        activePlanNombre={
          activePlan ? activePlan.nombrePlan : 'seleccionado'
        }
        onEdit={handleEditAvance}
        onDelete={handleDeleteRequest}
      />

      <AvanceForm
        open={openForm}
        onOpenChange={setOpenForm}
        onSave={handleSaveAvance}
        metas={metasVisibles}
        avanceToEdit={avanceToEdit}
      />

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este avance?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setAvanceToDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAvance}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AvancesPage;
