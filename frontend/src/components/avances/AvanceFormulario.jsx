import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

import { useAvance } from "@/context/AvanceContext";
import { useMeta } from "@/context/MetaContext";
import { useMunicipio } from "@/context/MunicipioContext";

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
  { key: "gasto_pro", label: "Propios", accumulatedKey: "acumulado_pro" },
  { key: "gasto_sgp", label: "SGP", accumulatedKey: "acumulado_sgp" },
  { key: "gasto_reg", label: "Regalías", accumulatedKey: "acumulado_reg" },
  { key: "gasto_cre", label: "Crédito", accumulatedKey: "acumulado_cre" },
  { key: "gasto_mun", label: "Municipio o Nación", accumulatedKey: "acumulado_mun" },
  { key: "gasto_otr", label: "Otros", accumulatedKey: "acumulado_otr" },
];

const AvanceFormulario = ({ meta, programacion, onClose, onSuccess, avance = null, readOnly = false }) => {
  const { toast } = useToast();
  const { addAvance, updateAvance, fetchAvanceById } = useAvance();
  const { fetchMetaById } = useMeta();

  // Guardamos la meta con detalle (acumulados) localmente
  const [detailedMeta, setDetailedMeta] = useState(meta);
  console.log(detailedMeta);

  const { municipios } = useMunicipio();

  const [formData, setFormData] = useState({
    descripcion: "",
    que_se_hizo: "",
    cuanto_se_invirtio: "",
    poblacion_beneficiada: "",
    como_se_ejecuto: "",
    cantidad: 0,
    gasto_pro: 0,
    gasto_sgp: 0,
    gasto_reg: 0,
    gasto_cre: 0,
    gasto_mun: 0,
    gasto_otr: 0,
    fec_especifica: "",
    municipios: [],
    archivos_nuevos: [],
    archivos_existentes: [],
    poblacion: initialPoblacion,
  });

  // Cargar info completa de la meta al montar para tener los acumulados
  useEffect(() => {
    let active = true;
    const loadMetaDetails = async () => {
      if (meta?.id) {
        const fullMeta = await fetchMetaById(meta.id);
        if (active && fullMeta) {
          setDetailedMeta(fullMeta);
        }
      }
    };
    loadMetaDetails();
    return () => { active = false; };
  }, [meta.id, fetchMetaById]);

  useEffect(() => {
    const loadAvanceData = async () => {
      if (avance) {
        // 1. Carga inicial rápida (con lo que venga en props)
        // Esto ayuda a que no se vea vacío mientras carga el full
        const mapToForm = (data) => ({
          descripcion: data.descripcion || "",
          que_se_hizo: data.que_se_hizo || "",
          cuanto_se_invirtio: data.cuanto_se_invirtio || "",
          poblacion_beneficiada: data.poblacion_beneficiada || "",
          como_se_ejecuto: data.como_se_ejecuto || "",
          cantidad: data.cantidadAvanzada ?? data.cantidad ?? 0,
          gasto_pro: data.gasto_pro || 0,
          gasto_sgp: data.gasto_sgp || 0,
          gasto_reg: data.gasto_reg || 0,
          gasto_cre: data.gasto_cre || 0,
          gasto_mun: data.gasto_mun || 0,
          gasto_otr: data.gasto_otr || 0,
          fec_especifica: data.fec_especifica ? data.fec_especifica.split("T")[0] : "",
          municipios: data.municipios || [],
          archivos_existentes: data.archivos || [],
          archivos_nuevos: [],
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

  const handleFileChange = (e) => {
    if (readOnly) return;
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast({ title: "Error", description: "Máximo 5 archivos permitidos", variant: "destructive" });
      e.target.value = "";
      return;
    }
    const oversized = files.find((f) => f.size > 2 * 1024 * 1024);
    if (oversized) {
      toast({ title: "Error", description: "Cada archivo debe pesar máximo 2MB", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setFormData((p) => ({ ...p, archivos_nuevos: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    if (!formData.descripcion) {
      toast({
        title: "Error",
        description: "Debe ingresar una descripción (Qué se hizo)",
        variant: "destructive",
      });
      return;
    }

    const payload = new FormData();
    payload.append("id_meta", meta.id);
    payload.append("anio", programacion.anio);
    payload.append("trimestre", programacion.trimestre);
    payload.append("descripcion", formData.descripcion);
    payload.append("que_se_hizo", formData.que_se_hizo);
    payload.append("cuanto_se_invirtio", formData.cuanto_se_invirtio);
    payload.append("poblacion_beneficiada", formData.poblacion_beneficiada);
    payload.append("como_se_ejecuto", formData.como_se_ejecuto);
    payload.append("cantidad", Number(formData.cantidad));

    payload.append("gasto_pro", Number(formData.gasto_pro));
    payload.append("gasto_sgp", Number(formData.gasto_sgp));
    payload.append("gasto_reg", Number(formData.gasto_reg));
    payload.append("gasto_cre", Number(formData.gasto_cre));
    payload.append("gasto_mun", Number(formData.gasto_mun));
    payload.append("gasto_otr", Number(formData.gasto_otr));

    if (formData.fec_especifica) {
      payload.append("fec_especifica", formData.fec_especifica);
    }

    payload.append("municipios", JSON.stringify(formData.municipios));

    Object.keys(formData.poblacion).forEach((key) => {
      payload.append(key, formData.poblacion[key]);
    });

    if (formData.archivos_nuevos && formData.archivos_nuevos.length > 0) {
      formData.archivos_nuevos.forEach((file) => {
        payload.append("archivos", file);
      });
    }

    let ok = false;
    if (avance) {
      ok = await updateAvance(avance.id, payload);
    } else {
      ok = await addAvance(payload);
    }

    if (ok) {
      if (onSuccess) onSuccess();
      onClose();
    }
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
          <p className="text-sm text-muted-foreground">
            Los valores en parentesis indican el acumulado de los trimestres anteriores.
          </p>
        </div>

        <div>
          <Label>a. ¿Qué se hizo?</Label>
          <Textarea
            name="que_se_hizo"
            value={formData.que_se_hizo}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div>
          <Label>b. ¿Cuánto se invirtió?</Label>
          <Textarea
            name="cuanto_se_invirtio"
            value={formData.cuanto_se_invirtio}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* MUNICIPIOS (c. Dónde se invirtió) */}
        <div className="space-y-2 mt-4">
          <Label>c. ¿Dónde se invirtió? (Municipios)</Label>
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

        <div>
          <Label>d. Población beneficiada (Detalle)</Label>
          <Textarea
            name="poblacion_beneficiada"
            value={formData.poblacion_beneficiada}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div>
          <Label>e. ¿Cómo se ejecutó?</Label>
          <Textarea
            name="como_se_ejecuto"
            value={formData.como_se_ejecuto}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div>
          <Label>Descripción General (Opcional)</Label>
          <Textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={2}
          />
        </div>

        <div>
          <Label>Cantidad ejecutada {detailedMeta.acumulado_fisico ? `(${detailedMeta.acumulado_fisico})` : "(0)"}</Label>
          <Input
            type="number"
            step="any"
            name="cantidad"
            min={0}
            value={formData.cantidad}
            onChange={handleChange}
          />
          <Label className="text-xs text-muted-foreground">
            Si la meta es recurrente, ingrese la cantidad acumulada una sola vez al año, puesto que el su valor se dividira en el cuatrenio.
          </Label>
        </div>

        <div className="space-y-3 border rounded-md p-4 mt-2 bg-slate-50 dark:bg-slate-900/50">
          <Label className="font-semibold">Ejecución Financiera (Valor en millones)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SOURCES.map((src) => (
              <div key={src.key}>
                <Label className="text-xs text-muted-foreground">
                  {src.label} {detailedMeta[src.accumulatedKey] ? `(${Number(detailedMeta[src.accumulatedKey]).toLocaleString("es-CO")})` : "(0)"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">$</span>
                  <Input
                    className="pl-6"
                    type="number"
                    step="any"
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
            <Label>Evidencias (Archivos)</Label>
            <Input
              type="file"
              name="archivos"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-muted-foreground mt-1">Máximo 5 archivos (máx 2MB c/u).</p>

            {/* Mostrar archivos ya subidos si los hay */}
            {formData.archivos_existentes && formData.archivos_existentes.length > 0 && (
              <div className="mt-2 text-sm border p-2 rounded-md bg-white">
                <p className="font-semibold text-xs mb-1">Archivos subidos previamente:</p>
                <ul className="list-disc list-inside">
                  {formData.archivos_existentes.map((a, i) => (
                    <li key={i}>
                      <a
                        href={`http://localhost:4000/uploads/avances/${a.key_archivo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {a.nombre_archivo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            ].map((key) => {
              const accKey = "acumulado_" + key.replace("cantidad_", "");
              return (
                <div key={key}>
                  <Label className="text-sm capitalize">
                    {key.replace("cantidad_", "").replace(/_/g, " - ")} años {detailedMeta[accKey] ? `(${detailedMeta[accKey]})` : "(0)"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    name={key}
                    value={formData.poblacion[key]}
                    onChange={handlePoblacionChange}
                  />
                </div>
              );
            })}
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
            ].map((key) => {
              const accKey = "acumulado_" + key.replace("cantesp_", "");
              return (
                <div key={key}>
                  <Label className="text-sm capitalize">
                    {key.replace("cantesp_", "")} {detailedMeta[accKey] ? `(${detailedMeta[accKey]})` : "(0)"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    name={key}
                    value={formData.poblacion[key]}
                    onChange={handlePoblacionChange}
                  />
                </div>
              );
            })}
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
