import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calendar, Target, DollarSign } from 'lucide-react';

const ProgramacionTrimestralForm = ({ open, onOpenChange, onSave, meta, activePlan }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    anio: '',
    trimestre: '',
    cantidadProgramada: 0,
    presupuestoProgramado: 0
  });

  const getTrimestresDisponibles = () => {
    if (!activePlan) return [];
    
    const anioInicio = new Date(activePlan.vigenciaInicio).getFullYear();
    const anioFin = new Date(activePlan.vigenciaFin).getFullYear();
    const trimestres = ['T1', 'T2', 'T3', 'T4'];
    
    const programacionExistente = meta?.programacionTrimestral || [];
    const programados = new Set(programacionExistente.map(p => `${p.anio}-${p.trimestre}`));
    
    const disponibles = [];
    for (let anio = anioInicio; anio <= anioFin; anio++) {
      for (const trimestre of trimestres) {
        const key = `${anio}-${trimestre}`;
        if (!programados.has(key)) {
          disponibles.push({ anio, trimestre, key });
        }
      }
    }
    
    return disponibles;
  };

  const getSiguienteTrimestre = () => {
    const disponibles = getTrimestresDisponibles();
    return disponibles.length > 0 ? disponibles[0] : null;
  };

  useEffect(() => {
    if (open && meta) {
      const siguiente = getSiguienteTrimestre();
      if (siguiente) {
        setFormData({
          anio: siguiente.anio.toString(),
          trimestre: siguiente.trimestre,
          cantidadProgramada: 0,
          presupuestoProgramado: 0
        });
      } else {
        setFormData({
          anio: '',
          trimestre: '',
          cantidadProgramada: 0,
          presupuestoProgramado: 0
        });
      }
    }
  }, [open, meta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.anio || !formData.trimestre) {
      toast({
        title: "Error de Validación",
        description: "Debe seleccionar año y trimestre.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.cantidadProgramada) <= 0) {
      toast({
        title: "Error de Validación",
        description: "La cantidad programada debe ser mayor a 0.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.presupuestoProgramado) < 0) {
      toast({
        title: "Error de Validación",
        description: "El presupuesto programado no puede ser negativo.",
        variant: "destructive",
      });
      return;
    }

    const siguiente = getSiguienteTrimestre();
    if (!siguiente || siguiente.anio.toString() !== formData.anio || siguiente.trimestre !== formData.trimestre) {
      toast({
        title: "Error de Orden",
        description: "Debe programar los trimestres en orden cronológico.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      ...formData,
      anio: parseInt(formData.anio),
      cantidadProgramada: parseFloat(formData.cantidadProgramada),
      presupuestoProgramado: parseFloat(formData.presupuestoProgramado)
    });
    
    onOpenChange(false);
  };

  const disponibles = getTrimestresDisponibles();
  const siguiente = getSiguienteTrimestre();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Trimestre
          </DialogTitle>
          <DialogDescription>
            Programe las metas esperadas para el siguiente trimestre. 
            {meta && (
              <span className="block mt-1 font-medium">
                Meta: {meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {disponibles.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-medium text-green-700">¡Programación Completa!</p>
            <p className="text-sm text-muted-foreground">
              Todos los trimestres del plan han sido programados para esta meta.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                Siguiente trimestre a programar: 
                <span className="ml-1 font-bold">
                  {siguiente ? `${siguiente.anio} - ${siguiente.trimestre}` : 'Ninguno disponible'}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Select 
                  value={formData.anio} 
                  onValueChange={(value) => handleSelectChange('anio', value)}
                  disabled={!siguiente}
                >
                  <SelectTrigger id="anio">
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {siguiente && (
                      <SelectItem value={siguiente.anio.toString()}>{siguiente.anio}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="trimestre">Trimestre</Label>
                <Select 
                  value={formData.trimestre} 
                  onValueChange={(value) => handleSelectChange('trimestre', value)}
                  disabled={!siguiente}
                >
                  <SelectTrigger id="trimestre">
                    <SelectValue placeholder="Seleccionar trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {siguiente && (
                      <SelectItem value={siguiente.trimestre}>
                        {siguiente.trimestre === 'T1' && 'Trimestre 1 (Ene-Mar)'}
                        {siguiente.trimestre === 'T2' && 'Trimestre 2 (Abr-Jun)'}
                        {siguiente.trimestre === 'T3' && 'Trimestre 3 (Jul-Sep)'}
                        {siguiente.trimestre === 'T4' && 'Trimestre 4 (Oct-Dic)'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cantidadProgramada">
                Cantidad Programada {meta?.unidadMedida && `(${meta.unidadMedida})`}
              </Label>
              <Input
                id="cantidadProgramada"
                name="cantidadProgramada"
                type="number"
                value={formData.cantidadProgramada}
                onChange={handleChange}
                placeholder="Ej: 25"
                min="0"
                step="0.01"
                disabled={!siguiente}
              />
              {meta?.cantidad && (
                <p className="text-xs text-muted-foreground mt-1">
                  Meta total: {meta.cantidad} {meta.unidadMedida}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="presupuestoProgramado">Presupuesto Programado</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="presupuestoProgramado"
                  name="presupuestoProgramado"
                  type="number"
                  value={formData.presupuestoProgramado}
                  onChange={handleChange}
                  placeholder="Ej: 50000"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  disabled={!siguiente}
                />
              </div>
              {meta?.presupuestoAnual && (
                <p className="text-xs text-muted-foreground mt-1">
                  Presupuesto total meta: ${meta.presupuestoAnual.reduce((sum, p) => sum + (p.valor || 0), 0).toLocaleString()}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button type="submit" disabled={!siguiente}>
                  Programar Trimestre
                </Button>
              </motion.div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProgramacionTrimestralForm;