import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const EDADES = [
  { key: "cantidad_0_5", label: "Niños y Niñas de 0-5" },
  { key: "cantidad_6_12", label: "Niños y Niñas de 6-12" },
  { key: "cantidad_13_17", label: "Adolescentes de 13-17" },
  { key: "cantidad_18_24", label: "Jóvenes de 18-24" },
  { key: "cantidad_25_62", label: "Adultos de 25-62" },
  { key: "cantidad_65_mas", label: "3ra Edad de 65 y más" },
];

const CONDICIONES = [
  { key: "cantesp_mujer", label: "Mujer jefe de hogar" },
  { key: "cantesp_discapacidad", label: "Discapacidad" },
  { key: "cantesp_etnia", label: "Etnias" },
  { key: "cantesp_victima", label: "Víctima" },
  { key: "cantesp_desmovilizado", label: "Desmovilizado" },
  { key: "cantesp_lgtbi", label: "OSIGD - LGBTI" },
  { key: "cantesp_migrante", label: "Migrante" },
  { key: "cantesp_indigente", label: "Indigente / Habitante de calle" },
  { key: "cantesp_privado", label: "Privada de la libertad" },
];

const MetaPoblacionFields = ({ formData, setFormData }) => {
  const update = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: parseInt(value, 10) || 0,
    }));
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h4 className="text-md font-medium">Caracterización de Población</h4>

      <div className="space-y-2">
        <Label>Cantidades por edad</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EDADES.map((e) => (
            <div key={e.key} className="grid grid-cols-2 gap-2 items-center">
              <Label className="text-xs">{e.label}</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={formData[e.key] ?? 0}
                onChange={(ev) => update(e.key, ev.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Condiciones especiales</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONDICIONES.map((c) => (
            <div key={c.key} className="grid grid-cols-2 gap-2 items-center">
              <Label className="text-xs">{c.label}</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={formData[c.key] ?? 0}
                onChange={(ev) => update(c.key, ev.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetaPoblacionFields;
