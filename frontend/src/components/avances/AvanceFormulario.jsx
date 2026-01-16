import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { useAvance } from "@/context/AvanceContext";

const initialPoblacion = {
  cantidad_0_5: 0,
  cantidad_6_12: 0,
  cantidad_13_17: 0,
  cantidad_18_24: 0,
  cantidad_25_62: 0,
  cantidad_65_mas: 0,

  cantesp_mujer: 0,
  cantesp_discapacidad: 0,
  cantesp_etnia: 0,
  cantesp_victima: 0,
  cantesp_desmovilizado: 0,
  cantesp_lgtbi: 0,
  cantesp_migrante: 0,
  cantesp_indigente: 0,
  cantesp_privado: 0,
};

const SOURCES = [
  { key: "gasto_pro", label: "Propios" },
  { key: "gasto_sgp", label: "SGP" },
  { key: "gasto_reg", label: "Regalías" },
  { key: "gasto_cre", label: "Crédito" },
  { key: "gasto_mun", label: "Municipio" },
  { key: "gasto_otr", label: "Otros" },
];

const AvanceFormulario = ({ meta, programacion, onClose, avance = null, readOnly = false }) => {
  const { toast } = useToast();
  const { addAvance, updateAvance, fetchAvanceById } = useAvance();

  const [formData, setFormData] = useState({
    descripcion: "",
    cantidad: 0,
    gasto_pro: 0,
    gasto_sgp: 0,
    gasto_reg: 0,
    gasto_cre: 0,
    gasto_mun: 0,
    gasto_otr: 0,
    fec_especifica: "",
    url_evidencia: "",
    poblacion: initialPoblacion,
  });

  useEffect(() => {
    const loadAvanceData = async () => {
      if (avance) {
        // 1. Carga inicial rápida (con lo que venga en props)
        // Esto ayuda a que no se vea vacío mientras carga el full
        const mapToForm = (data) => ({
          descripcion: data.descripcion || "",
          cantidad: data.cantidadAvanzada || 0,
          gasto_pro: data.gasto_pro || 0,
          gasto_sgp: data.gasto_sgp || 0,
          gasto_reg: data.gasto_reg || 0,
          gasto_cre: data.gasto_cre || 0,
          gasto_mun: data.gasto_mun || 0,
          gasto_otr: data.gasto_otr || 0,
          fec_especifica: data.fec_especifica ? data.fec_especifica.split("T")[0] : "",
          url_evidencia: data.evidenciaURL || "",
          poblacion: {
            cantidad_0_5: data.cantidad_0_5 || 0,
            cantidad_6_12: data.cantidad_6_12 || 0,
            cantidad_13_17: data.cantidad_13_17 || 0,
            cantidad_18_24: data.cantidad_18_24 || 0,
            cantidad_25_62: data.cantidad_25_62 || 0,
            cantidad_65_mas: data.cantidad_65_mas || 0,
            cantesp_mujer: data.cantesp_mujer || 0,
            cantesp_discapacidad: data.cantesp_discapacidad || 0,
            cantesp_etnia: data.cantesp_etnia || 0,
            cantesp_victima: data.cantesp_victima || 0,
            cantesp_desmovilizado: data.cantesp_desmovilizado || 0,
            cantesp_lgtbi: data.cantesp_lgtbi || 0,
            cantesp_migrante: data.cantesp_migrante || 0,
            cantesp_indigente: data.cantesp_indigente || 0,
            cantesp_privado: data.cantesp_privado || 0,
          }
        });

        setFormData(mapToForm(avance));

        // 2. Cargar datos completos por ID (si se permite editar/ver)
        // Usamos fetchAvanceById para asegurar que tenemos toda la info poblacional
        const fullData = await fetchAvanceById(avance.id);
        if (fullData) {
          setFormData(mapToForm(fullData));
        }
      }
    };

    loadAvanceData();
  }, [avance]);

  if (!meta || !programacion) return null;

  const handleChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePoblacionChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      poblacion: {
        ...p.poblacion,
        [name]: Number(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    if (!formData.descripcion) {
      toast({
        title: "Error",
        description: "Debe ingresar una descripción",
        variant: "destructive",
      });
      return;
    }

    if (formData.url_evidencia) {
      try {
        new URL(formData.url_evidencia);
      } catch (_) {
        toast({
          title: "Error de validación",
          description: "La URL de evidencia no es válida. Asegúrese de incluir http:// o https://",
          variant: "destructive",
        });
        return;
      }
    }

    const payload = {
      id_meta: meta.id,
      anio: programacion.anio,
      trimestre: programacion.trimestre,
      descripcion: formData.descripcion,
      cantidad: Number(formData.cantidad),

      // Gastos individualizados
      gasto_pro: Number(formData.gasto_pro),
      gasto_sgp: Number(formData.gasto_sgp),
      gasto_reg: Number(formData.gasto_reg),
      gasto_cre: Number(formData.gasto_cre),
      gasto_mun: Number(formData.gasto_mun),
      gasto_otr: Number(formData.gasto_otr),

      fec_especifica: formData.fec_especifica || null,
      url_evidencia: formData.url_evidencia || null,
      ...formData.poblacion,
    };

    let ok = false;
    if (avance) {
      ok = await updateAvance(avance.id, payload);
    } else {
      ok = await addAvance(payload);
    }

    if (ok) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={readOnly} className="contents">
        {/* CONTEXTO */}
        <div className="rounded-md border bg-muted/40 p-4">
          <p className="font-semibold">{meta.nombre}</p>
          <p className="text-sm text-muted-foreground">
            Año {programacion.anio} · {programacion.trimestre}
          </p>
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div>
          <Label>Cantidad ejecutada</Label>
          <Input
            type="number"
            name="cantidad"
            min={0}
            value={formData.cantidad}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-3 border rounded-md p-4 mt-2 bg-slate-50 dark:bg-slate-900/50">
          <Label className="font-semibold">Ejecución Financiera (Valor en millones)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SOURCES.map((src) => (
              <div key={src.key}>
                <Label className="text-xs text-muted-foreground">{src.label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">$</span>
                  <Input
                    className="pl-6"
                    type="number"
                    name={src.key}
                    min={0}
                    value={formData[src.key]}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-sm font-medium mt-2">
            Total Gasto: $
            {(
              Number(formData.gasto_pro || 0) +
              Number(formData.gasto_sgp || 0) +
              Number(formData.gasto_reg || 0) +
              Number(formData.gasto_cre || 0) +
              Number(formData.gasto_mun || 0) +
              Number(formData.gasto_otr || 0)
            ).toLocaleString("es-CO")}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Fecha específica</Label>
            <Input
              type="date"
              name="fec_especifica"
              value={formData.fec_especifica}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>URL evidencia</Label>
            <Input
              name="url_evidencia"
              value={formData.url_evidencia}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          {/* GRUPO 1: EDADES */}
          <p className="font-semibold mb-3">Caracterización de Población</p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              "cantidad_0_5",
              "cantidad_6_12",
              "cantidad_13_17",
              "cantidad_18_24",
              "cantidad_25_62",
              "cantidad_65_mas",
            ].map((key) => (
              <div key={key}>
                <Label className="text-sm capitalize">
                  {key.replace("cantidad_", "").replace(/_/g, " - ")} años
                </Label>
                <Input
                  type="number"
                  min={0}
                  name={key}
                  value={formData.poblacion[key]}
                  onChange={handlePoblacionChange}
                />
              </div>
            ))}
          </div>

          {/* GRUPO 2: CONDICIONES */}
          <p className="font-semibold mb-3">Condiciones especiales</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "cantesp_mujer",
              "cantesp_discapacidad",
              "cantesp_etnia",
              "cantesp_victima",
              "cantesp_desmovilizado",
              "cantesp_lgtbi",
              "cantesp_migrante",
              "cantesp_indigente",
              "cantesp_privado",
            ].map((key) => (
              <div key={key}>
                <Label className="text-sm capitalize">
                  {key.replace("cantesp_", "")}
                </Label>
                <Input
                  type="number"
                  min={0}
                  name={key}
                  value={formData.poblacion[key]}
                  onChange={handlePoblacionChange}
                />
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {readOnly ? "Cerrar" : "Cancelar"}
        </Button>
        {!readOnly && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button type="submit">
              {avance ? "Guardar Cambios" : "Registrar avance"}
            </Button>
          </motion.div>
        )}
      </div>
    </form>
  );
};

export default AvanceFormulario;
