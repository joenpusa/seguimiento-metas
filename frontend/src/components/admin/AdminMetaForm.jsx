import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlan } from '@/context/PlanContext';
import MetaFormPresupuesto from './metaFormSections/MetaFormPresupuesto';
import MetaFormPoblacion from './metaFormSections/MetaFormPoblacion';
import MetaFormMunicipios from './metaFormSections/MetaFormMunicipios';


const MAX_ANIOS_PRESUPUESTO = 4; 

const AdminMetaForm = ({ open, onOpenChange, onSave, metaToEdit = null, iniciativaNombre }) => {
  const { toast } = useToast();
  const { listaMunicipios, listaResponsables, listaUnidadesMedida } = usePlan();

  const initialPoblacionState = {
    categoriasEdad: [],
    condicionesEspeciales: [],
  };

  const initialFormState = {
    idMeta: '',
    numeroMetaManual: '',
    nombreMeta: '',
    descripcionMeta: '',
    cantidad: 0,
    unidadMedida: '',
    responsable: '',
    fechaLimite: '',
    municipios: [], 
    presupuestoAnual: Array(MAX_ANIOS_PRESUPUESTO).fill(null).map((_, i) => ({ anio: i + 1, valor: 0 })),
    esRecurrenteAnual: false,
    poblacionBeneficiada: initialPoblacionState,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showPoblacionDialog, setShowPoblacionDialog] = useState(false);
  
  useEffect(() => {
    if (metaToEdit) {
      const presupuestoExistente = metaToEdit.presupuestoAnual || [];
      const presupuestoCompleto = Array(MAX_ANIOS_PRESUPUESTO).fill(null).map((_, i) => {
        const anioActual = i + 1;
        const presupuestoEncontrado = presupuestoExistente.find(p => p.anio === anioActual);
        return presupuestoEncontrado || { anio: anioActual, valor: 0 };
      });

      setFormData({
        idMeta: metaToEdit.idMeta,
        numeroMetaManual: metaToEdit.numeroMetaManual || '',
        nombreMeta: metaToEdit.nombreMeta,
        descripcionMeta: metaToEdit.descripcionMeta || '',
        cantidad: metaToEdit.cantidad,
        unidadMedida: metaToEdit.unidadMedida,
        responsable: metaToEdit.responsable,
        fechaLimite: metaToEdit.fechaLimite,
        municipios: metaToEdit.municipios || [],
        presupuestoAnual: presupuestoCompleto,
        esRecurrenteAnual: metaToEdit.esRecurrenteAnual || false,
        poblacionBeneficiada: metaToEdit.poblacionBeneficiada || initialPoblacionState,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [metaToEdit, open]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requiredFields = ['nombreMeta', 'cantidad', 'unidadMedida', 'responsable', 'fechaLimite'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast({
          title: "Error de validación",
          description: `El campo "${field.replace(/([A-Z])/g, ' $1').toLowerCase()}" es obligatorio.`,
          variant: "destructive",
        });
        return;
      }
    }
    if (formData.cantidad <= 0) {
       toast({ title: "Error de validación", description: `La cantidad debe ser mayor a cero.`, variant: "destructive" });
       return;
    }
    if (formData.municipios.length === 0) {
       toast({ title: "Error de validación", description: `Debe seleccionar al menos un municipio.`, variant: "destructive" });
       return;
    }
    const presupuestoTotal = formData.presupuestoAnual.reduce((sum, p) => sum + (p.valor || 0), 0);
    if (presupuestoTotal <= 0) {
       toast({ title: "Error de validación", description: `El presupuesto total de la meta debe ser mayor a cero.`, variant: "destructive" });
       return;
    }

    const dataToSave = {
        ...formData,
        presupuestoAnual: formData.presupuestoAnual.filter(p => p.valor > 0)
    };

    onSave(dataToSave);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setFormData(initialFormState);
    }}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>
            {metaToEdit ? 'Editar Meta' : 'Nueva Meta'} para {iniciativaNombre}
          </DialogTitle>
          <DialogDescription>
            Complete la información de la meta, incluyendo el presupuesto por año y detalles de población.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="numeroMetaManual">Número de Meta (Manual)</Label>
              <Input id="numeroMetaManual" name="numeroMetaManual" value={formData.numeroMetaManual} onChange={handleChange} placeholder="Ej: 1.1, A2 (Opcional)" className="mt-1"/>
            </div>

            <div>
              <Label htmlFor="nombreMeta">Nombre de la Meta</Label>
              <Input id="nombreMeta" name="nombreMeta" value={formData.nombreMeta} onChange={handleChange} placeholder="Nombre corto y descriptivo" className="mt-1"/>
            </div>
            
            <div>
              <Label htmlFor="descripcionMeta">Descripción Detallada (Opcional)</Label>
              <Textarea id="descripcionMeta" name="descripcionMeta" value={formData.descripcionMeta} onChange={handleChange} placeholder="Describa en detalle la meta" rows={2} className="mt-1"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="cantidad">Cantidad Total (Física)</Label>
                <Input id="cantidad" name="cantidad" type="number" value={formData.cantidad} onChange={handleChange} placeholder="Ej: 100" min="0" className="mt-1"/>
              </div>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                <Checkbox 
                  id="esRecurrenteAnual" 
                  name="esRecurrenteAnual"
                  checked={formData.esRecurrenteAnual} 
                  onCheckedChange={(checked) => handleSelectChange('esRecurrenteAnual', checked)}
                />
                <Label htmlFor="esRecurrenteAnual" className="text-sm font-normal">
                  Meta recurrente anualmente (la cantidad es por año)
                </Label>
              </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unidadMedida">Unidad de Medida (Física)</Label>
                 <Select value={formData.unidadMedida} onValueChange={(value) => handleSelectChange('unidadMedida', value)}>
                  <SelectTrigger id="unidadMedida" className="mt-1"><SelectValue placeholder="Seleccionar Unidad" /></SelectTrigger>
                  <SelectContent>
                    {listaUnidadesMedida?.map(unidad => (
                      <SelectItem key={unidad.id} value={unidad.nombre}>{unidad.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="responsable">Responsable</Label>
                 <Select value={formData.responsable} onValueChange={(value) => handleSelectChange('responsable', value)}>
                  <SelectTrigger id="responsable" className="mt-1"><SelectValue placeholder="Seleccionar Responsable" /></SelectTrigger>
                  <SelectContent>
                    {listaResponsables?.map(resp => (
                      <SelectItem key={resp.id} value={resp.nombre}>{resp.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="fechaLimite">Fecha Límite</Label>
              <Input id="fechaLimite" name="fechaLimite" type="date" value={formData.fechaLimite} onChange={handleChange} className="mt-1"/>
            </div>

            <MetaFormMunicipios
              formData={formData}
              setFormData={setFormData}
              listaMunicipios={listaMunicipios}
            />
            
            <MetaFormPresupuesto
              formData={formData}
              setFormData={setFormData}
              maxAnios={MAX_ANIOS_PRESUPUESTO}
            />

            <div>
              <Button type="button" variant="outline" onClick={() => setShowPoblacionDialog(true)} className="w-full">
                Detallar Población Beneficiada
              </Button>
            </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false);
              setFormData(initialFormState);
            }}>
              Cancelar
            </Button>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button type="submit">
                {metaToEdit ? 'Actualizar Meta' : 'Crear Meta'}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
        {showPoblacionDialog && (
          <MetaFormPoblacion
            open={showPoblacionDialog}
            onOpenChange={setShowPoblacionDialog}
            poblacionData={formData.poblacionBeneficiada}
            onSave={(poblacion) => {
              setFormData(prev => ({...prev, poblacionBeneficiada: poblacion}));
              setShowPoblacionDialog(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminMetaForm;