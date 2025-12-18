import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { usePlan } from "@/context/PlanContext";
import { useUnidad } from "@/context/UnidadContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";

import MetaFormHierarchicalFields from "@/components/MetaFormHierarchicalFields";
import MetaFormBasicFields from "@/components/MetaFormBasicFields";

const MetaForm = ({ open, onOpenChange, onSave, metaToEdit = null }) => {
  const { toast } = useToast();

  // 🔹 Contextos correctos
  const { estructuraPDI, activePlanId } = usePlan();
  const { unidades } = useUnidad();
  const { secretarias } = useSecretaria();
  const { municipios } = useMunicipio();

  const initialFormState = {
    id: "",
    planId: activePlanId || "",
    lineaEstrategica: "",
    componente: "",
    apuesta: "",
    iniciativa: "",
    nombre: "",
    descripcion: "",
    cantidad: 0,
    unidadMedida: "",
    responsable: "",
    fechaLimite: "",
    progreso: 0,
    municipios: [],
    avances: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (metaToEdit) {
      setFormData(metaToEdit);
    } else {
      setFormData({ ...initialFormState, planId: activePlanId });
    }
  }, [metaToEdit, open, activePlanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMunicipioChange = (municipioId) => {
    setFormData((prev) => ({
      ...prev,
      municipios: prev.municipios.includes(municipioId)
        ? prev.municipios.filter((m) => m !== municipioId)
        : [...prev.municipios, municipioId],
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setFormData({ ...initialFormState, planId: activePlanId });
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {metaToEdit
              ? "Editar Meta (Modo Lectura)"
              : "Crear Nueva Meta (Modo Lectura)"}
          </DialogTitle>
          <DialogDescription>
            Este formulario es solo para visualización. La gestión de metas se
            realiza en &quot;Administración General&quot;.
          </DialogDescription>
        </DialogHeader>

        <form>
          {/* 🔒 SOLO LECTURA */}
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
                listaMunicipios={municipios}
                listaResponsables={secretarias}
                listaUnidadesMedida={unidades}
                metaToEdit={metaToEdit}
              />
            </div>
          </fieldset>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({ ...initialFormState, planId: activePlanId });
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetaForm;
