import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { useMeta } from "@/context/MetaContext";
import { usePlan } from "@/context/PlanContext";
import { useUnidad } from "@/context/UnidadContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";

const MetaForm = ({ open, onOpenChange, onSave, metaToEdit = null }) => {
  const { toast } = useToast();
  const { selectedMeta } = useMeta();
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
    if (selectedMeta) {
      setFormData({
        ...initialFormState,
        ...selectedMeta,
        planId: activePlanId,
      });
    } else {
      setFormData({ ...initialFormState, planId: activePlanId });
    }
  }, [selectedMeta, open, activePlanId]);


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
             Detalles de la Meta (Modo Lectura)
          </DialogTitle>
          <DialogDescription>
            Este formulario es solo para visualización. La gestión de metas se
            realiza en &quot;Administración General&quot;.
          </DialogDescription>
        </DialogHeader>

        <form>
          {/* 🔒 SOLO LECTURA */}
          <fieldset disabled>
            <div className="grid gap-6 py-4">

              {/* 🌳 ESTRUCTURA JERÁRQUICA */}
              <div className="space-y-4">

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Línea estratégica
                  </Label>
                  <p className="font-medium">
                    {selectedMeta?.linea
                      ? `${selectedMeta.linea.codigo} - ${selectedMeta.linea.nombre}`
                      : "—"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Componente
                  </Label>
                  <p className="font-medium">
                    {selectedMeta?.componente
                      ? `${selectedMeta.componente.codigo} - ${selectedMeta.componente.nombre}`
                      : "—"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Apuesta
                  </Label>
                  <p className="font-medium">
                    {selectedMeta?.apuesta
                      ? `${selectedMeta.apuesta.codigo} - ${selectedMeta.apuesta.nombre}`
                      : "—"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Iniciativa
                  </Label>
                  <p className="font-medium">
                    {selectedMeta?.iniciativa
                      ? `${selectedMeta.iniciativa.codigo} - ${selectedMeta.iniciativa.nombre}`
                      : "—"}
                  </p>
                </div>

              </div>

              <hr />

              {/* 🎯 META */}
              <div className="space-y-4">

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Meta
                  </Label>
                  <p className="font-semibold text-lg">
                    {selectedMeta?.nombre || "—"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Descripción
                  </Label>
                  <p className="text-sm leading-relaxed">
                    {selectedMeta?.descripcion || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Cantidad
                    </Label>
                    <p className="font-medium">
                      {selectedMeta?.cantidad ?? "—"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Unidad de medida
                    </Label>
                    <p className="font-medium">
                      {selectedMeta?.unidad.nombre || "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Fecha límite
                  </Label>
                  <p className="font-medium">
                    {selectedMeta?.fechaLimite
                      ? new Date(selectedMeta.fechaLimite).toLocaleDateString("es-CO")
                      : "—"}
                  </p>
                </div>
                {/* =========================
                    💰 PRESUPUESTO
                ========================== */}
                <div className="space-y-3">

                  <Label className="text-sm font-semibold">
                    Presupuesto por año
                  </Label>

                  <div className="rounded-md border p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">

                    {[
                      { label: "Año 1", value: selectedMeta?.valores?.valor1 },
                      { label: "Año 2", value: selectedMeta?.valores?.valor2 },
                      { label: "Año 3", value: selectedMeta?.valores?.valor3 },
                      { label: "Año 4", value: selectedMeta?.valores?.valor4 },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="grid grid-cols-[1fr_auto] items-center"
                      >
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>

                        <span className="font-medium">
                          {typeof value === "number"
                            ? `$ ${value.toLocaleString("es-CO")}`
                            : "—"}
                        </span>
                      </div>
                    ))}

                    {/* TOTAL */}
                    <div className="border-t pt-2 mt-2 grid grid-cols-[1fr_auto]">
                      <span className="text-sm font-semibold">
                        Total
                      </span>
                      <span className="font-semibold">
                        $
                        {(
                          (selectedMeta?.valores?.valor1 || 0) +
                          (selectedMeta?.valores?.valor2 || 0) +
                          (selectedMeta?.valores?.valor3 || 0) +
                          (selectedMeta?.valores?.valor4 || 0)
                        ).toLocaleString("es-CO")}
                      </span>
                    </div>

                  </div>
                </div>
                {/* =========================
                    MUNICIPIOS
                ========================== */}
                <div className="space-y-2 mt-4">
                  <Label>Municipios</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                    {municipios.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={formData.municipios.includes(m.id)}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              municipios: checked
                                ? [...prev.municipios, m.id]
                                : prev.municipios.filter((id) => id !== m.id),
                            }))
                          }
                        />
                        {m.nombre}
                      </label>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </fieldset>

{/* 
          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
            {JSON.stringify(formData, null, 2)}
          </pre> */}

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
