import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";

import { useUnidad } from "@/context/UnidadContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";

import MetaPoblacionFields from "@/components/admin/metas/MetaPoblacionFields";

const initialState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  cantidad: 0,
  valor: 0,
  valor2: 0,
  valor3: 0,
  valor4: 0,
  recurrente: false,
  fecha_limite: "",
  id_unidad: null,
  id_secretaria: null,
  municipios: [],

  // edades
  cantidad_0_5: 0,
  cantidad_6_12: 0,
  cantidad_13_17: 0,
  cantidad_18_24: 0,
  cantidad_25_62: 0,
  cantidad_65_mas: 0,

  // condiciones especiales
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

const MetaDialog = ({ open, onOpenChange, onSave, metaEdit }) => {
  const { unidades } = useUnidad();
  const { secretarias } = useSecretaria();
  const { municipios } = useMunicipio();

  const [formData, setFormData] = useState(initialState);
  const isEditing = !!metaEdit;

  useEffect(() => {
    if (metaEdit) {
      setFormData({
        ...initialState,
        ...metaEdit,
        municipios: metaEdit.municipios || [],
      });
    } else {
      setFormData(initialState);
    }
  }, [metaEdit, open]);

  /** 👉 ÚNICO MÉTODO NUEVO */
  const totalPresupuesto =
    (formData.valor || 0) +
    (formData.valor2 || 0) +
    (formData.valor3 || 0) +
    (formData.valor4 || 0);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Meta" : "Nueva Meta"}
          </DialogTitle>
        </DialogHeader>

        {/* =========================
            DATOS BÁSICOS
        ========================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Código de la meta</Label>
            <Input
              value={formData.codigo}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label>Nombre de la meta</Label>
            <Input
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label>Descripción detallada</Label>
            <Input
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </div>

          {/* Cantidad + Recurrente */}
          <div className="space-y-2">
            <Label>Cantidad total (Física)</Label>
            <Input
              type="number"
              min="0"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cantidad: Number(e.target.value),
                })
              }
            />

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={formData.recurrente}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, recurrente: checked })
                }
              />
              Meta recurrente durante los 4 años
            </label>
          </div>

          <div>
            <Label>Fecha límite</Label>
            <Input
              type="date"
              value={formData.fecha_limite}
              onChange={(e) =>
                setFormData({ ...formData, fecha_limite: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Unidad de medida</Label>
            <Select
              value={formData.id_unidad?.toString() || ""}
              onValueChange={(v) =>
                setFormData({ ...formData, id_unidad: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione unidad" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Responsable</Label>
            <Select
              value={formData.id_secretaria?.toString() || ""}
              onValueChange={(v) =>
                setFormData({ ...formData, id_secretaria: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione secretaría" />
              </SelectTrigger>
              <SelectContent>
                {secretarias.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* =========================
            PRESUPUESTO
        ========================== */}
        <div className="mt-4">
          <Label className="mb-1 block">Presupuesto por año</Label>

          <div className="space-y-2 rounded-md border p-3 bg-slate-50 dark:bg-slate-800/50">
            {[
              { label: "Año 1", field: "valor" },
              { label: "Año 2", field: "valor2" },
              { label: "Año 3", field: "valor3" },
              { label: "Año 4", field: "valor4" },
            ].map(({ label, field }) => (
              <div
                key={field}
                className="grid grid-cols-[auto_1fr] items-center gap-2"
              >
                <Label className="text-sm text-muted-foreground">
                  {label}:
                </Label>

                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field]: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>
            ))}

            <div className="text-right text-sm font-medium pt-1">
              Total: ${totalPresupuesto.toLocaleString()}
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

        {/* =========================
            POBLACIÓN BENEFICIADA
        ========================== */}
        <MetaPoblacionFields
          formData={formData}
          setFormData={setFormData}
        />

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetaDialog;
