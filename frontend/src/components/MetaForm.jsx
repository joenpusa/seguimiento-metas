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
import { useMetas } from '@/context/MetasContext';
import MetaFormHierarchicalFields from '@/components/MetaFormHierarchicalFields';
import MetaFormBasicFields from '@/components/MetaFormBasicFields';

const MetaForm = ({ open, onOpenChange, onSave, metaToEdit = null }) => {
  const { toast } = useToast();
  const { estructuraPDI, listaMunicipios, listaResponsables, activePlanId, listaUnidadesMedida } = useMetas();

  const initialFormState = {
    id: '',
    planId: activePlanId || '',
    lineaEstrategica: '',
    componente: '',
    apuesta: '',
    iniciativa: '',
    nombre: '',
    descripcion: '',
    cantidad: 0,
    unidadMedida: '',
    responsable: '',
    fechaLimite: '',
    progreso: 0,
    municipios: [], 
    avances: []
  };

  const [formData, setFormData] = useState(initialFormState);
  
  useEffect(() => {
    if (metaToEdit) {
      setFormData(metaToEdit);
    } else {
      setFormData({...initialFormState, planId: activePlanId });
    }
  }, [metaToEdit, open, activePlanId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMunicipioChange = (municipioNombre) => {
    setFormData(prev => {
      const newMunicipios = prev.municipios.includes(municipioNombre)
        ? prev.municipios.filter(m => m !== municipioNombre)
        : [...prev.municipios, municipioNombre];
      return { ...prev, municipios: newMunicipios };
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requiredFields = ['lineaEstrategica', 'componente', 'apuesta', 'iniciativa', 'nombre', 'descripcion', 'cantidad', 'unidadMedida', 'responsable', 'fechaLimite'];
    for (const field of requiredFields) {
      if (!formData[field] && field !== 'progreso' && field !== 'avances' && field !== 'id' && field !== 'planId') {
        toast({
          title: "Error de validación",
          description: `El campo "${field.replace(/([A-Z])/g, ' $1').toLowerCase()}" es obligatorio.`,
          variant: "destructive",
        });
        return;
      }
    }
     if (formData.municipios.length === 0) {
       toast({ title: "Error de validación", description: `Debe seleccionar al menos un municipio.`, variant: "destructive" });
       return;
    }
    if (formData.cantidad <= 0) {
       toast({
          title: "Error de validación",
          description: `La cantidad debe ser mayor a cero.`,
          variant: "destructive",
        });
        return;
    }

    onSave(formData);
    toast({
      title: metaToEdit ? "Meta actualizada" : "Meta creada",
      description: `La meta "${formData.nombre}" ha sido ${metaToEdit ? 'actualizada' : 'creada'} correctamente.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setFormData({...initialFormState, planId: activePlanId});
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {metaToEdit ? 'Editar Meta (Modo Lectura)' : 'Crear Nueva Meta (Modo Lectura)'}
          </DialogTitle>
          <DialogDescription>
            Este formulario es solo para visualización. La gestión de metas se realiza en "Administración General".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <fieldset disabled>
            <div className="grid gap-4 py-4">
              <MetaFormHierarchicalFields 
                formData={formData}
                setFormData={setFormData}
                handleSelectChange={handleSelectChange}
                estructuraPDI={estructuraPDI}
              />
              <MetaFormBasicFields
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleMunicipioChange={handleMunicipioChange}
                listaMunicipios={listaMunicipios}
                listaResponsables={listaResponsables}
                listaUnidadesMedida={listaUnidadesMedida}
                metaToEdit={metaToEdit}
              />
            </div>
          </fieldset>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false);
              setFormData({...initialFormState, planId: activePlanId});
            }}>
              Cerrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetaForm;