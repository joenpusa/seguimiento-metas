import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvanceFormMetaFields from '@/components/avances/AvanceFormMetaFields';
import AvanceFormFinancialFields from '@/components/avances/AvanceFormFinancialFields';
import AvanceFormPoblacionFields from '@/components/avances/AvanceFormPoblacionFields';
import AvanceFormMunicipios from '@/components/avances/AvanceFormMunicipios';
import { usePlan } from '@/context/PlanContext';


const AvanceFormInputs = ({ 
    formData, 
    setFormData,
    handleChange, 
    handleSelectChange, 
    metas, 
    avanceToEdit, 
    availableAnios, 
    trimestres,
    selectedMetaUnidad,
    selectedMetaPresupuestoTotal
}) => {
  const { listaMunicipios } = usePlan();

  return (
    <>
      <AvanceFormMetaFields
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        metas={metas}
        avanceToEdit={avanceToEdit}
        availableAnios={availableAnios}
        trimestres={trimestres}
      />
      
      <AvanceFormFinancialFields
        formData={formData}
        handleChange={handleChange}
        selectedMetaUnidad={selectedMetaUnidad}
        selectedMetaPresupuestoTotal={selectedMetaPresupuestoTotal}
      />
      
      <div>
        <Label htmlFor="evidenciaURL">Evidencia (URL)</Label>
        <Input
          id="evidenciaURL"
          name="evidenciaURL"
          value={formData.evidenciaURL}
          onChange={handleChange}
          placeholder="Enlace a foto, PDF, etc. (Opcional)"
          className="mt-1"
        />
      </div>

      <AvanceFormMunicipios
        formData={formData}
        setFormData={setFormData}
        listaMunicipios={listaMunicipios}
      />

      <AvanceFormPoblacionFields
        formData={formData}
        setFormData={setFormData}
      />
    </>
  );
};

export default AvanceFormInputs;