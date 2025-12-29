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

const AvanceFormulario = ({ meta, programacion, onClose }) => {
  const { toast } = useToast();
  const { addAvance } = useAvance();

  const [formData, setFormData] = useState({
    descripcion: "",
    cantidad: 0,
    gasto: 0,
    fec_especifica: "",
    url_evidencia: "",
    poblacion: initialPoblacion,
  });

  if (!meta || !programacion) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePoblacionChange = (e) => {
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

    if (!formData.descripcion) {
      toast({
        title: "Error",
        description: "Debe ingresar una descripción",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      id_meta: meta.id,
      anio: programacion.anio,
      trimestre: programacion.trimestre,
      descripcion: formData.descripcion,
      cantidad: Number(formData.cantidad),
      gasto: Number(formData.gasto),
      fec_especifica: formData.fec_especifica || null,
      url_evidencia: formData.url_evidencia || null,
      ...formData.poblacion,
    };

    const ok = await addAvance(payload);
    if (ok) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid md:grid-cols-2 gap-4">
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

        <div>
          <Label>Gasto ejecutado</Label>
          <Input
            type="number"
            name="gasto"
            min={0}
            value={formData.gasto}
            onChange={handleChange}
          />
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
        <p className="font-semibold mb-3">Población beneficiada</p>

        <div className="grid md:grid-cols-3 gap-3">
          {Object.keys(initialPoblacion).map((key) => (
            <div key={key}>
              <Label className="text-xs capitalize">
                {key.replaceAll("_", " ")}
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button type="submit">Registrar avance</Button>
        </motion.div>
      </div>
    </form>
  );
};

export default AvanceFormulario;
