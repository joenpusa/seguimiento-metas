import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Settings, ListChecks, MapPin, Users, Ruler, KeyRound, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import AdminEstructuraPlan from '@/components/admin/AdminEstructuraPlan';
import AdminMunicipios from '@/components/admin/AdminMunicipios';
import AdminResponsables from '@/components/admin/AdminResponsables';
import AdminPlanesList from '@/components/admin/AdminPlanesList';
import AdminUnidadesMedida from '@/components/admin/AdminUnidadesMedida';
import AdminUsuarios from '@/components/admin/AdminUsuarios';

const AdminPlanPage = () => {
  const { 
    planesDesarrollo, 
    activePlanId, 
    getActivePlan, 
    addPlanDesarrollo, 
    updatePlanDesarrolloInfo,
    deletePlanDesarrollo,
    setActivePlanContext,
    loading 
  } = usePlan();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planFormData, setPlanFormData] = useState({ nombrePlan: '', vigenciaInicio: '', vigenciaFin: '' });
  
  const getDefaultTab = () => {
    if (currentUser?.rol === 'admin') return 'planes';
    return 'unidades'; // Usuarios no admin solo ven unidades de medida aquí
  };
  const [currentTab, setCurrentTab] = useState(getDefaultTab()); 

  const activePlan = getActivePlan();

  const handleOpenPlanDialog = (plan = null) => {
    if (currentUser?.rol !== 'admin') {
      toast({ title: "Acceso Denegado", description: "No tiene permisos para esta acción.", variant: "destructive" });
      return;
    }
    setEditingPlan(plan);
    if (plan) {
      setPlanFormData({ nombrePlan: plan.nombrePlan, vigenciaInicio: plan.vigenciaInicio, vigenciaFin: plan.vigenciaFin });
    } else {
      setPlanFormData({ nombrePlan: '', vigenciaInicio: '', vigenciaFin: '' });
    }
    setOpenPlanDialog(true);
  };

  const handleSavePlan = () => {
    if (currentUser?.rol !== 'admin') {
      toast({ title: "Acceso Denegado", description: "No tiene permisos para esta acción.", variant: "destructive" });
      return;
    }
    if (!planFormData.nombrePlan.trim() || !planFormData.vigenciaInicio || !planFormData.vigenciaFin) {
      toast({ title: "Error", description: "Todos los campos del plan son obligatorios.", variant: "destructive" });
      return;
    }
    if (new Date(planFormData.vigenciaInicio) >= new Date(planFormData.vigenciaFin)) {
      toast({ title: "Error", description: "La fecha de inicio debe ser anterior a la fecha de fin.", variant: "destructive" });
      return;
    }

    if (editingPlan) {
      updatePlanDesarrolloInfo(editingPlan.id, planFormData);
    } else {
      addPlanDesarrollo(planFormData);
    }
    setOpenPlanDialog(false);
  };
  
  const handleDeletePlan = (planId) => {
    if (currentUser?.rol !== 'admin') {
      toast({ title: "Acceso Denegado", description: "No tiene permisos para esta acción.", variant: "destructive" });
      return;
    }
    deletePlanDesarrollo(planId);
  };

  const handleSelectPlan = (planId) => {
    if (currentUser?.rol !== 'admin') return; 
    if (setActivePlanContext) {
      setActivePlanContext(planId);
      setCurrentTab('estructura'); 
    } else {
      console.error("setActivePlanContext no está definido en usePlan");
      toast({ title: "Error", description: "No se pudo cambiar el plan activo.", variant: "destructive" });
    }
  };

  const allTabs = [
    { id: 'planes', label: 'Planes', icon: ListChecks, adminOnly: true },
    { id: 'estructura', label: 'Estructura', icon: Settings, adminOnly: true, disabled: !activePlanId },
    { id: 'municipios', label: 'Municipios', icon: MapPin, adminOnly: true },
    { id: 'responsables', label: 'Responsables', icon: Users, adminOnly: true },
    { id: 'usuarios', label: 'Usuarios', icon: ShieldCheck, adminOnly: true },
    { id: 'unidades', label: 'Unidades Medida', icon: Ruler, adminOnly: false },
  ];

  const visibleTabs = allTabs.filter(tab => currentUser?.rol === 'admin' ? true : !tab.adminOnly);

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-100px)]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4 text-gray-500">Cargando...</p></div>;
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Administración General</h1>
            <p className="text-muted-foreground">Gestione los planes de desarrollo, su estructura y catálogos.</p>
          </div>
          {currentTab === 'planes' && currentUser?.rol === 'admin' && (
            <Button size="sm" className="gap-1 mt-2 sm:mt-0" onClick={() => handleOpenPlanDialog()}>
              <Plus size={16} /> Nuevo Plan de Desarrollo
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex border-b overflow-x-auto pb-px">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setCurrentTab(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
              ${currentTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      <motion.div 
        key={currentTab} 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'planes' && currentUser?.rol === 'admin' && (
          <AdminPlanesList 
            planes={planesDesarrollo}
            onEditPlan={handleOpenPlanDialog}
            onDeletePlan={handleDeletePlan}
            onSelectPlan={handleSelectPlan}
            activePlanId={activePlanId}
          />
        )}
        {currentTab === 'estructura' && activePlan && currentUser?.rol === 'admin' && <AdminEstructuraPlan key={activePlan.id} plan={activePlan} />}
        {currentTab === 'municipios' && currentUser?.rol === 'admin' && <AdminMunicipios />}
        {currentTab === 'responsables' && currentUser?.rol === 'admin' && <AdminResponsables />}
        {currentTab === 'usuarios' && currentUser?.rol === 'admin' && <AdminUsuarios />}
        {currentTab === 'unidades' && <AdminUnidadesMedida />}
      </motion.div>

      <Dialog open={openPlanDialog} onOpenChange={setOpenPlanDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar' : 'Nuevo'} Plan de Desarrollo</DialogTitle>
            <DialogDescription>
              Complete la información del plan de desarrollo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombrePlan">Nombre del Plan</Label>
              <Input id="nombrePlan" value={planFormData.nombrePlan} onChange={(e) => setPlanFormData({...planFormData, nombrePlan: e.target.value})} placeholder="Ej: Plan de Desarrollo 2024-2027" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vigenciaInicio">Vigencia Inicio</Label>
                <Input id="vigenciaInicio" type="date" value={planFormData.vigenciaInicio} onChange={(e) => setPlanFormData({...planFormData, vigenciaInicio: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vigenciaFin">Vigencia Fin</Label>
                <Input id="vigenciaFin" type="date" value={planFormData.vigenciaFin} onChange={(e) => setPlanFormData({...planFormData, vigenciaFin: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPlanDialog(false)}>Cancelar</Button>
            <Button onClick={handleSavePlan}><Save size={16} className="mr-2"/> {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlanPage;