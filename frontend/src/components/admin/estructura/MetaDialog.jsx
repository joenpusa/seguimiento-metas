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
  // Presupuesto Detallado
  // Año 1
  val1_pro: 0, val1_sgp: 0, val1_reg: 0, val1_cre: 0, val1_mun: 0, val1_otr: 0,
  // Año 2
  val2_pro: 0, val2_sgp: 0, val2_reg: 0, val2_cre: 0, val2_mun: 0, val2_otr: 0,
  // Año 3
  val3_pro: 0, val3_sgp: 0, val3_reg: 0, val3_cre: 0, val3_mun: 0, val3_otr: 0,
  // Año 4
  val4_pro: 0, val4_sgp: 0, val4_reg: 0, val4_cre: 0, val4_mun: 0, val4_otr: 0,
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



const SOURCES = [
  { key: "pro", label: "Propios" },
  { key: "sgp", label: "SGP" },
  { key: "reg", label: "Regalías" },
  { key: "cre", label: "Crédito" },
  { key: "mun", label: "Municipio" },
  { key: "otr", label: "Otros" },
];

const TabsYearSelector = ({ formData, setFormData }) => {
  const [year, setYear] = useState(1);

  const handleChange = (sourceKey, val) => {
    setFormData((prev) => ({
      ...prev,
      [`val${year}_${sourceKey}`]: Number(val) || 0,
    }));
  };

  // Calculate total for current year tab
  const currentYearTotal = SOURCES.reduce(
    (acc, src) => acc + (formData[`val${year}_${src.key}`] || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs Header */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {[1, 2, 3, 4].map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors
              ${year === y
                ? "bg-white dark:bg-slate-800 border-b-2 border-primary text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            `}
          >
            Año {y}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 animate-in fade-in zoom-in-95 duration-200">
        {SOURCES.map((src) => (
          <div key={src.key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{src.label}</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                className="pl-7 h-8 text-sm"
                placeholder="0"
                value={formData[`val${year}_${src.key}`] || 0}
                onChange={(e) => handleChange(src.key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Year Summary */}
      <div className="text-right text-xs text-muted-foreground font-medium border-t pt-2 border-dashed">
        Total Año {year}: ${currentYearTotal.toLocaleString()}
      </div>
    </div>
  );
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
  /** 👉 ÚNICO MÉTODO NUEVO */
  const totalPresupuesto =
    // Año 1
    (formData.val1_pro || 0) + (formData.val1_sgp || 0) + (formData.val1_reg || 0) + (formData.val1_cre || 0) + (formData.val1_mun || 0) + (formData.val1_otr || 0) +
    // Año 2
    (formData.val2_pro || 0) + (formData.val2_sgp || 0) + (formData.val2_reg || 0) + (formData.val2_cre || 0) + (formData.val2_mun || 0) + (formData.val2_otr || 0) +
    // Año 3
    (formData.val3_pro || 0) + (formData.val3_sgp || 0) + (formData.val3_reg || 0) + (formData.val3_cre || 0) + (formData.val3_mun || 0) + (formData.val3_otr || 0) +
    // Año 4
    (formData.val4_pro || 0) + (formData.val4_sgp || 0) + (formData.val4_reg || 0) + (formData.val4_cre || 0) + (formData.val4_mun || 0) + (formData.val4_otr || 0);

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
            PRESUPUESTO (TABS FLOW)
        ========================== */}
        <div className="mt-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
          <Label className="mb-3 block text-base font-semibold">
            Recursos Financieros (Valor en miles de millones)
          </Label>

          <TabsYearSelector formData={formData} setFormData={setFormData} />

          <div className="text-right text-sm font-medium pt-3 mt-2 border-t">
            Total Presupuesto Cuatrenio: ${totalPresupuesto.toLocaleString()}
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
