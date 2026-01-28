import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useMeta } from "@/context/MetaContext";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import { useAvance } from "@/context/AvanceContext";
import { useSecretaria } from "@/context/SecretariaContext";
import AvanceFilters from "@/components/avances/AvanceFilters";
import AvanceList from "@/components/avances/AvanceList";
import AvanceFormulario from "@/components/avances/AvanceFormulario";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


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
    const { secretarias = [], } = useSecretaria();
    const { metas = [], loading: metasLoading, fetchMetas } = useMeta();
    const { getActivePlan, loading: planLoading } =
        usePlan();
    const { currentUser } = useAuth();

    const {
        avances = [],
        loadingAvances,
        fetchAvances,
        addAvance,
        updateAvance,
        removeAvance,
    } = useAvance();

    /* =========================
       ESTADOS
    ========================== */
    const [openForm, setOpenForm] = useState(false);
    const [avanceToEdit, setAvanceToEdit] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        metaId: "",
        anio: "",
        trimestre: "",
        responsableId: "",
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [avanceToDelete, setAvanceToDelete] = useState(null);

    const activePlan = getActivePlan();
    const loading = metasLoading || planLoading || loadingAvances;
    const activePlanId = activePlan?.id;

    /* =========================
       CARGA INICIAL
    ========================== */
    useEffect(() => {
        if (activePlanId) {
            fetchAvances({ idPlan: activePlanId });
        }
    }, [activePlanId]);

    useEffect(() => {
        if (!activePlanId) return;

        fetchMetas({
            idPlan: activePlanId,
        });
    }, [activePlanId]);


    /* =========================
       METAS VISIBLES SEGÚN ROL
    ========================== */
    const metasVisibles = useMemo(() => {
        if (!currentUser) return [];

        if (currentUser.rol === "admin") return metas;

        if (currentUser.rol === "responsable") {
            return metas.filter(
                (m) => m.secretaria_nombre === currentUser.nombre
            );
        }

        return [];
    }, [metas, currentUser]);


    /* =========================
       ENRIQUECER AVANCES
    ========================== */
    const avancesEnriquecidos = useMemo(() => {
        return avances.map((a) => {
            const meta = metas.find(
                (m) => Number(m.id) === Number(a.idMeta)
            );

            return {
                ...a,
                idMeta: Number(a.idMeta),
                anio: Number(a.anio),

                metaNombre: meta?.nombre ?? "N/A",
                metaNumero: meta?.numeroMetaManual ?? "",
                metaUnidadMedida: meta?.unidad_nombre ?? "",
                metaResponsable: meta?.secretaria_nombre ?? "",
            };
        });
    }, [avances, metas]);


    /* =========================
       AÑOS DISPONIBLES
    ========================== */
    const availableYears = useMemo(() => {
        if (!activePlan?.vigenciaInicio || !activePlan?.vigenciaFin) {
            return [];
        }

        const startYear = new Date(
            activePlan.vigenciaInicio + "T00:00:00"
        ).getFullYear();

        const endYear = new Date(
            activePlan.vigenciaFin + "T00:00:00"
        ).getFullYear();

        const years = [];
        for (let y = startYear; y <= endYear; y++) {
            years.push(y);
        }

        return years;
    }, [activePlan]);



    /* =========================
       FILTRADO + ORDEN
    ========================== */
    const avancesFiltradosYOrdenados = useMemo(() => {
        const filtrados = avancesEnriquecidos.filter((a) => {
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                a.descripcion?.toLowerCase().includes(searchLower) ||
                a.metaNombre?.toLowerCase().includes(searchLower) ||
                a.metaNumero?.toString().includes(searchLower);

            const matchesMeta = filters.metaId
                ? Number(a.idMeta) === Number(filters.metaId)
                : true;

            const matchesAnio = filters.anio
                ? a.anio === Number(filters.anio)
                : true;

            const matchesTrimestre = filters.trimestre
                ? a.trimestre === filters.trimestre
                : true;

            let matchesResponsable = true;

            if (currentUser?.rol === "admin") {
                matchesResponsable = filters.responsableId
                    ? a.metaResponsable === filters.responsableId
                    : true;
            }

            if (currentUser?.rol === "responsable") {
                matchesResponsable =
                    a.metaResponsable === currentUser.nombre;
            }

            return (
                matchesSearch &&
                matchesMeta &&
                matchesAnio &&
                matchesTrimestre &&
                matchesResponsable
            );
        });

        return filtrados.sort((a, b) => {
            if (b.anio !== a.anio) return b.anio - a.anio;
            if (b.trimestre !== a.trimestre)
                return (b.trimestre || "").localeCompare(
                    a.trimestre || ""
                );
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [avancesEnriquecidos, searchTerm, filters, currentUser]);

    /* =========================
       HANDLERS
    ========================== */
    const handleSaveAvance = async (data) => {
        if (avanceToEdit) {
            await updateAvance(avanceToEdit.id, data);
        } else {
            await addAvance(data);
        }

        setOpenForm(false);
        setAvanceToEdit(null);
        fetchAvances({ idPlan: activePlan.idPlan });
    };

    const handleEditAvance = (avance) => {
        setAvanceToEdit(avance);
        setIsReadOnly(false);
        setOpenForm(true);
    };

    const handleViewAvance = (avance) => {
        setAvanceToEdit(avance);
        setIsReadOnly(true);
        setOpenForm(true);
    };

    const handleDeleteRequest = (avance) => {
        setAvanceToDelete(avance);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAvance = async () => {
        if (avanceToDelete) {
            await removeAvance(avanceToDelete.id);
            fetchAvances({ idPlan: activePlan.idPlan });
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
                <h1 className="text-2xl font-bold tracking-tight">
                    Avances del Plan: {activePlan?.nombrePlan ?? "N/A"}
                </h1>
            </motion.div>

            <AvanceFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
                metas={metasVisibles}
                availableYears={availableYears}
                listaResponsables={secretarias}
                currentUser={currentUser}
            />

            <AvanceList
                avances={avancesFiltradosYOrdenados}
                loading={loading}
                onEdit={handleEditAvance}
                onView={handleViewAvance}
                onDelete={handleDeleteRequest}
            />

            {/* FORMULARIO AVANCE (EDITAR / VER) */}
            <Dialog open={openForm} onOpenChange={setOpenForm}>
                <DialogContent className="w-[80vw] max-w-[80vw] h-[90vh] sm:max-w-[80vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isReadOnly ? "Detalle del Avance" : "Editar Avance"}
                        </DialogTitle>
                    </DialogHeader>

                    {avanceToEdit && (
                        <AvanceFormulario
                            meta={{
                                id: avanceToEdit.idMeta,
                                nombre: avanceToEdit.metaNombre,
                            }}
                            programacion={{
                                anio: avanceToEdit.anio,
                                trimestre: avanceToEdit.trimestre,
                            }}
                            avance={avanceToEdit}
                            readOnly={isReadOnly}
                            onClose={() => setOpenForm(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

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
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
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