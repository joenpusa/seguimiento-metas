import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { usePlan } from '@/context/PlanContext';
import AvanceFormInputs from '@/components/avances/AvanceFormInputs';
import { v4 as uuidv4 } from 'uuid';

const getCurrentYear = () => new Date().getFullYear();
const ANIOS_AVANCE = Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i); 
const TRIMESTRES = [
  { id: 'T1', nombre: 'Trimestre 1 (Ene-Mar)' },
  { id: 'T2', nombre: 'Trimestre 2 (Abr-Jun)' },
  { id: 'T3', nombre: 'Trimestre 3 (Jul-Sep)' },
  { id: 'T4', nombre: 'Trimestre 4 (Oct-Dic)' },
];

const AvanceForm = ({ open, onOpenChange, onSave, metas, avanceToEdit = null }) => {
  const { toast } = useToast();
  const { getActivePlan, getAvancesByMetaId } = usePlan();
  const activePlan = getActivePlan();

  const getInitialAnioVigencia = () => {
    if (activePlan?.vigenciaInicio) {
      return new Date(activePlan.vigenciaInicio).getFullYear();
    }
    return getCurrentYear();
  };
  
  const initialAvanceFormState = {
    idAvance: null,
    metaId: '',
    fecha: new Date().toISOString().split('T')[0],
    anioAvance: getInitialAnioVigencia(),
    trimestreAvance: '',
    descripcion: '',
    cantidadAvanzada: 0,
    gastoEjecutado: 0,
    evidenciaURL: '', 
    municipiosBeneficiadosAvance: [],
    poblacionBeneficiadaAvance: { cantidadesPorCategoria: {}, cantidadesPorCondicion: {} },
  };

  const [formData, setFormData] = useState(initialAvanceFormState);
  const [selectedMetaUnidad, setSelectedMetaUnidad] = useState('');
  const [selectedMetaPresupuestoTotal, setSelectedMetaPresupuestoTotal] = useState(0);
  const [availableAnios, setAvailableAnios] = useState(ANIOS_AVANCE);

  useEffect(() => {
    if (activePlan?.vigenciaInicio && activePlan?.vigenciaFin) {
      const inicio = new Date(activePlan.vigenciaInicio).getFullYear();
      const fin = new Date(activePlan.vigenciaFin).getFullYear();
      const planAnios = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
      setAvailableAnios(planAnios);
      if (!planAnios.includes(formData.anioAvance)) {
        setFormData(prev => ({ ...prev, anioAvance: planAnios[0] || getCurrentYear() }));
      }
    } else {
      setAvailableAnios(ANIOS_AVANCE);
    }
  }, [activePlan, formData.anioAvance]);

  useEffect(() => {
    if (avanceToEdit) {
      setFormData({
        idAvance: avanceToEdit.idAvance,
        metaId: avanceToEdit.metaId,
        fecha: avanceToEdit.fecha,
        anioAvance: avanceToEdit.anioAvance || getInitialAnioVigencia(),
        trimestreAvance: avanceToEdit.trimestreAvance || '',
        descripcion: avanceToEdit.descripcion,
        cantidadAvanzada: avanceToEdit.cantidadAvanzada,
        gastoEjecutado: avanceToEdit.gastoEjecutado,
        evidenciaURL: avanceToEdit.evidenciaURL || '',
        municipiosBeneficiadosAvance: avanceToEdit.municipiosBeneficiadosAvance || [],
        poblacionBeneficiadaAvance: avanceToEdit.poblacionBeneficiadaAvance || { cantidadesPorCategoria: {}, cantidadesPorCondicion: {} },
      });
    } else {
      setFormData(initialAvanceFormState);
    }
  }, [avanceToEdit, open, activePlan]);

  useEffect(() => {
    if (formData.metaId && metas) {
      const meta = metas.find(m => m.idMeta === formData.metaId);
      if (meta) {
        setSelectedMetaUnidad(meta.unidadMedida);
        const presupuestoTotal = meta.presupuestoAnual?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;
        setSelectedMetaPresupuestoTotal(presupuestoTotal);
      } else {
        setSelectedMetaUnidad('');
        setSelectedMetaPresupuestoTotal(0);
      }
    } else {
      setSelectedMetaUnidad('');
      setSelectedMetaPresupuestoTotal(0);
    }
  }, [formData.metaId, metas]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateProgresiveOrder = (metaId, anio, trimestre) => {
    if (!metaId || avanceToEdit) return true;
    
    const meta = metas.find(m => m.idMeta === metaId);
    if (!meta) return false;
    
    const programacion = meta.programacionTrimestral || [];
    if (programacion.length === 0) {
      toast({
        title: "Programación Requerida",
        description: "Debe programar los trimestres antes de reportar avances para esta meta.",
        variant: "destructive",
      });
      return false;
    }
    
    const avances = meta.avances || [];
    const reportados = new Set(avances.map(a => `${a.anioAvance}-${a.trimestreAvance}`));
    
    const pendientes = programacion.filter(p => !reportados.has(`${p.anio}-${p.trimestre}`));
    
    if (pendientes.length === 0) {
      toast({
        title: "Todos los Trimestres Reportados",
        description: "Ya se han reportado todos los trimestres programados para esta meta.",
        variant: "destructive",
      });
      return false;
    }
    
    pendientes.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.trimestre.localeCompare(b.trimestre);
    });
    
    const siguiente = pendientes[0];
    
    if (siguiente.anio !== anio || siguiente.trimestre !== trimestre) {
      toast({
        title: "Orden Incorrecto",
        description: `Debe reportar el trimestre ${siguiente.anio} - ${siguiente.trimestre} antes de continuar.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requiredFields = ['metaId', 'descripcion', 'cantidadAvanzada', 'gastoEjecutado', 'anioAvance', 'trimestreAvance'];
    for (const field of requiredFields) {
        if (formData[field] === undefined || formData[field] === '' || (typeof formData[field] === 'number' && isNaN(formData[field]))) {
             toast({
                title: "Error de Validación",
                description: `El campo "${field.replace(/([A-Z])/g, ' $1').toLowerCase()}" es obligatorio.`,
                variant: "destructive",
            });
            return;
        }
    }

     if (parseFloat(formData.cantidadAvanzada) < 0) {
      toast({ title: "Error de Validación", description: "La cantidad avanzada no puede ser negativa.", variant: "destructive" });
      return;
    }
     if (parseFloat(formData.gastoEjecutado) < 0) {
      toast({ title: "Error de Validación", description: "El gasto ejecutado no puede ser negativo.", variant: "destructive" });
      return;
    }

    if (!validateProgresiveOrder(formData.metaId, formData.anioAvance, formData.trimestreAvance)) {
      return;
    }

    if (!avanceToEdit && formData.metaId) { 
      const avancesExistentes = getAvancesByMetaId(formData.metaId);
      const existeAvanceMismoPeriodo = avancesExistentes.some(
        (av) => av.anioAvance === formData.anioAvance && av.trimestreAvance === formData.trimestreAvance
      );

      if (existeAvanceMismoPeriodo) {
        toast({
          title: "Error de Duplicidad",
          description: `Ya existe un avance registrado para esta meta en el Año ${formData.anioAvance} - Trimestre ${formData.trimestreAvance}. Solo se permite un avance por trimestre.`,
          variant: "destructive",
          duration: 7000,
        });
        return;
      }
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setFormData(initialAvanceFormState); 
    }}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{avanceToEdit ? 'Editar Avance' : 'Registrar Nuevo Avance'}</DialogTitle>
          <DialogDescription>
            Complete la información del avance. Los avances deben reportarse en orden cronológico según la programación trimestral.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <AvanceFormInputs
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              metas={metas}
              avanceToEdit={avanceToEdit}
              availableAnios={availableAnios}
              trimestres={TRIMESTRES}
              selectedMetaUnidad={selectedMetaUnidad}
              selectedMetaPresupuestoTotal={selectedMetaPresupuestoTotal}
            />
          
          <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-4">
            <Button type="button" variant="outline" onClick={() => {
                onOpenChange(false);
            }}>
              Cancelar
            </Button>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button type="submit">
                {avanceToEdit ? 'Actualizar Avance' : 'Registrar Avance'}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AvanceForm;