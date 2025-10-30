import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

const AvanceFormFinancialFields = ({ formData, handleChange, selectedMetaUnidad, selectedMetaPresupuestoTotal }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="cantidadAvanzada">
          Cantidad Avanzada {selectedMetaUnidad && `(en ${selectedMetaUnidad})`}
        </Label>
        <Input
          id="cantidadAvanzada"
          name="cantidadAvanzada"
          type="number"
          value={formData.cantidadAvanzada}
          onChange={handleChange}
          placeholder="Ej: 10"
          min="0"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="gastoEjecutado">Gasto Ejecutado</Label>
        <div className="relative mt-1">
            <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="gastoEjecutado"
            name="gastoEjecutado"
            type="number"
            value={formData.gastoEjecutado}
            onChange={handleChange}
            placeholder="Ej: 5000"
            min="0"
            className="pl-7"
          />
        </div>
        {selectedMetaPresupuestoTotal > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Presupuesto total meta: ${selectedMetaPresupuestoTotal.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default AvanceFormFinancialFields;