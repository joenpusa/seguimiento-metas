import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const ESTADO_PROGRESO_OPTIONS = [
  { id: "SIN_INICIAR", nombre: "Sin iniciar (0%)" },
  { id: "EN_EJECUCION", nombre: "En ejecución (1–99%)" },
  { id: "COMPLETADA", nombre: "Completada (100%)" },
];

const MetasFilterControls = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  listaResponsables = [],
  listaMunicipios = [],
  currentUser,
}) => {
  const isResponsable =
    currentUser && currentUser.rol === "responsable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
    >

      {/* RESPONSABLE */}
      <div>
        <Label
          htmlFor="filterResponsableMeta"
          className="text-xs text-muted-foreground"
        >
          Responsable
        </Label>

        <Select
          value={
            isResponsable
              ? currentUser.id_secretaria?.toString()
              : filters.responsableId
          }
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              responsableId: value,
            }))
          }
          disabled={isResponsable}
        >
          <SelectTrigger
            id="filterResponsableMeta"
            className="w-full"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {listaResponsables.map((resp) => (
              <SelectItem
                key={resp.id}
                value={resp.id.toString()}
              >
                {resp.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 🗺️ MUNICIPIO */}
      <div>
        <Label
          htmlFor="filterMunicipioMeta"
          className="text-xs text-muted-foreground"
        >
          Municipio
        </Label>

        <Select
          value={filters.municipioId}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              municipioId: value,
            }))
          }
        >
          <SelectTrigger
            id="filterMunicipioMeta"
            className="w-full"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {listaMunicipios.map((mun) => (
              <SelectItem
                key={mun.id}
                value={mun.id.toString()}
              >
                {mun.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ESTADO */}
      <div>
        <Label
          htmlFor="filterEstadoProgreso"
          className="text-xs text-muted-foreground"
        >
          Estado de Progreso
        </Label>

        <Select
          value={filters.estadoProgreso}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              estadoProgreso: value,
            }))
          }
        >
          <SelectTrigger
            id="filterEstadoProgreso"
            className="w-full"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {ESTADO_PROGRESO_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

export default MetasFilterControls;
