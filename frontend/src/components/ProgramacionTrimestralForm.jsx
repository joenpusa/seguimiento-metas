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
import { useProgramacion } from "@/context/ProgramacionContext";


const ProgramacionTrimestralForm = ({ open, onOpenChange, onSave, meta, activePlan, programacionToEdit }) => {
  const { toast } = useToast();
  const { getSiguienteTrimestre } = useProgramacion();

  const [formData, setFormData] = useState({
    anio: '',
    trimestre: '',
    cantidadProgramada: 0,
    gasto_pro: 0,
    gasto_cre: 0,
    gasto_sgp: 0,
    gasto_mun: 0,
    gasto_otr: 0,
    gasto_reg: 0
  });

  const [siguiente, setSiguiente] = useState(null);

  useEffect(() => {
    if (open) {
      if (programacionToEdit) {
        // MODO EDICIÓN
        setSiguiente({
          anio: programacionToEdit.anio,
          trimestre: programacionToEdit.trimestre
        });
        setFormData({
          anio: programacionToEdit.anio.toString(),
          trimestre: programacionToEdit.trimestre,
          cantidadProgramada: programacionToEdit.cantidadProgramada || 0,
          gasto_pro: programacionToEdit.gasto_programado_pro || 0,
          gasto_cre: programacionToEdit.gasto_programado_cre || 0,
          gasto_sgp: programacionToEdit.gasto_programado_sgp || 0,
          gasto_mun: programacionToEdit.gasto_programado_mun || 0,
          gasto_otr: programacionToEdit.gasto_programado_otr || 0,
          gasto_reg: programacionToEdit.gasto_programado_reg || 0,
        });
      } else if (meta && activePlan) {
        // MODO CREACIÓN
        getSiguienteTrimestre(meta.id, activePlan)
          .then(res => {
            if (res) {
              setSiguiente(res);
              setFormData({
                anio: res.anio.toString(),
                trimestre: res.trimestre,
                cantidadProgramada: 0,
                gasto_pro: 0,
                gasto_cre: 0,
                gasto_sgp: 0,
                gasto_mun: 0,
                gasto_otr: 0,
                gasto_reg: 0
              });
            } else {
              setSiguiente(null);
            }
          });
      }
    }
  }, [open, meta, activePlan, programacionToEdit]);


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

    if (parseFloat(formData.cantidadProgramada) < 0) {
      toast({
        title: "Error de Validación",
        description: "La cantidad programada no puede ser menor a 0.",
        variant: "destructive",
      });
      return;
    }

    const totalGasto = (
      (parseFloat(formData.gasto_sgp) || 0) +
      (parseFloat(formData.gasto_pro) || 0) +
      (parseFloat(formData.gasto_cre) || 0) +
      (parseFloat(formData.gasto_mun) || 0) +
      (parseFloat(formData.gasto_reg) || 0) +
      (parseFloat(formData.gasto_otr) || 0)
    );

    if (totalGasto < 0) {
      toast({
        title: "Error de Validación",
        description: "El presupuesto programado no puede ser negativo.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id_meta: meta.id,
      anio: Number(formData.anio),
      trimestre: formData.trimestre,
      cantidad: Number(formData.cantidadProgramada),
      gasto_pro: Number(formData.gasto_pro),
      gasto_cre: Number(formData.gasto_cre),
      gasto_sgp: Number(formData.gasto_sgp),
      gasto_mun: Number(formData.gasto_mun),
      gasto_otr: Number(formData.gasto_otr),
      gasto_reg: Number(formData.gasto_reg),
    });


    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {programacionToEdit ? "Editar Programación" : "Programar Trimestre"}
          </DialogTitle>
          <DialogDescription>
            {programacionToEdit
              ? "Modifique los valores programados para este trimestre."
              : "Programe las metas esperadas para el siguiente trimestre."
            }
            {meta && (
              <span className="block mt-1 font-medium">
                Meta: {meta.codigo} - {meta.nombre}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!siguiente ? (
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
                {programacionToEdit ? "Editando trimestre:" : "Siguiente trimestre a programar:"}
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
                  disabled={!siguiente || !!programacionToEdit}
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
                  disabled={!siguiente || !!programacionToEdit}
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
              {/* {meta?.cantidad && (
                <p className="text-xs text-muted-foreground mt-1">
                  Meta total: {meta.cantidad} {meta.unidadMedida}
                </p>
              )} */}
            </div>

            <div>
              <Label className="mb-2 block">Desglose Presupuestal (Valor en millones)</Label>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">

                {/* SGP */}
                <div>
                  <Label htmlFor="gasto_sgp" className="text-xs text-muted-foreground">SGP</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_sgp"
                      name="gasto_sgp"
                      type="number"
                      value={formData.gasto_sgp}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

                {/* Propio */}
                <div>
                  <Label htmlFor="gasto_pro" className="text-xs text-muted-foreground">Propio</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_pro"
                      name="gasto_pro"
                      type="number"
                      value={formData.gasto_pro}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

                {/* Crédito */}
                <div>
                  <Label htmlFor="gasto_cre" className="text-xs text-muted-foreground">Crédito</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_cre"
                      name="gasto_cre"
                      type="number"
                      value={formData.gasto_cre}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

                {/* Municipal */}
                <div>
                  <Label htmlFor="gasto_mun" className="text-xs text-muted-foreground">Municipal o Nacional</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_mun"
                      name="gasto_mun"
                      type="number"
                      value={formData.gasto_mun}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

                {/* Regalías */}
                <div>
                  <Label htmlFor="gasto_reg" className="text-xs text-muted-foreground">Regalías</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_reg"
                      name="gasto_reg"
                      type="number"
                      value={formData.gasto_reg}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

                {/* Otros */}
                <div>
                  <Label htmlFor="gasto_otr" className="text-xs text-muted-foreground">Otros</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gasto_otr"
                      name="gasto_otr"
                      type="number"
                      value={formData.gasto_otr}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="pl-6 h-8 text-sm"
                      disabled={!siguiente}
                    />
                  </div>
                </div>

              </div>

              {/* Total Calculado */}
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-sm font-medium">Total Presupuesto Programado:</span>
                <span className="font-bold text-lg">
                  ${(
                    (parseFloat(formData.gasto_sgp) || 0) +
                    (parseFloat(formData.gasto_pro) || 0) +
                    (parseFloat(formData.gasto_cre) || 0) +
                    (parseFloat(formData.gasto_mun) || 0) +
                    (parseFloat(formData.gasto_reg) || 0) +
                    (parseFloat(formData.gasto_otr) || 0)
                  ).toLocaleString()}
                </span>
              </div>

              {meta?.presupuestoAnual && (
                <p className="text-xs text-muted-foreground mt-1 text-right">
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
                  {programacionToEdit ? "Guardar Cambios" : "Programar Trimestre"}
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