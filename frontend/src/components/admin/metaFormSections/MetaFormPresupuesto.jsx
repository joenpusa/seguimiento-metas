import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

const MetaFormPresupuesto = ({ formData, setFormData, maxAnios }) => {
  const handlePresupuestoChange = (index, value) => {
    const nuevoPresupuesto = [...formData.presupuestoAnual];
    nuevoPresupuesto[index] = { ...nuevoPresupuesto[index], valor: parseFloat(value) || 0 };
    setFormData(prev => ({ ...prev, presupuestoAnual: nuevoPresupuesto }));
  };

  return (
    <div>
      <Label className="mb-1 block">Presupuesto Anual</Label>
      <div className="space-y-2 rounded-md border p-3 bg-slate-50 dark:bg-slate-800/50">
        {formData.presupuestoAnual.slice(0, maxAnios).map((presupuesto, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr] items-center gap-2">
            <Label htmlFor={`presupuestoAnio${index + 1}`} className="text-sm text-muted-foreground">Año {presupuesto.anio}:</Label>
            <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                id={`presupuestoAnio${index + 1}`}
                type="number"
                value={presupuesto.valor}
                onChange={(e) => handlePresupuestoChange(index, e.target.value)}
                placeholder="0"
                min="0"
                className="pl-7"
              />
            </div>
          </div>
        ))}
          <div className="text-right text-sm font-medium pt-1">
          Total: ${formData.presupuestoAnual.reduce((sum, p) => sum + (p.valor || 0), 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MetaFormPresupuesto;