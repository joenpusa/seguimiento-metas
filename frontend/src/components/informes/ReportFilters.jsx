import React from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

/**
 * Select genérico reutilizable
 */
const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  isObject = false,
  valueKey = 'nombre',
  labelKey = 'nombre'
}) => (
  <Select value={value ?? ''} onValueChange={onChange}>
    <SelectTrigger className="w-full h-9 text-xs">
      <div className="flex items-center gap-1 truncate">
        <Filter className="h-3 w-3 shrink-0" />
        <SelectValue placeholder={placeholder} />
      </div>
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="">
        {`Todos ${label.toLowerCase()}`}
      </SelectItem>

      {options.map((opt) => {
        const itemValue = isObject ? opt[valueKey] : opt;
        const itemLabel = isObject ? opt[labelKey] : opt;

        return (
          <SelectItem key={itemValue} value={itemValue}>
            {itemLabel}
          </SelectItem>
        );
      })}
    </SelectContent>
  </Select>
);

const ReportFilters = ({
  filters,
  onFilterChange,
  municipios = [],
  responsables = []
}) => {
  const handleChange = (key) => (value) => {
    onFilterChange({ [key]: value });
  };

  const TRIMESTRES = [
    { id: 'T1', nombre: 'Trimestre 1' },
    { id: 'T2', nombre: 'Trimestre 2' },
    { id: 'T3', nombre: 'Trimestre 3' },
    { id: 'T4', nombre: 'Trimestre 4' }
  ];

  const YEARS = [2024, 2025, 2026, 2027];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {/* Municipio */}
      <FilterSelect
        label="Municipios"
        value={filters.municipio}
        onChange={handleChange('municipio')}
        options={municipios}
        placeholder="Municipio"
        isObject={true}
        valueKey="id"
        labelKey="nombre"
      />

      {/* Año */}
      <Select
        value={filters.anio ?? ''}
        onValueChange={handleChange('anio')}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <div className="flex items-center gap-1 truncate">
            <Filter className="h-3 w-3 shrink-0" />
            <SelectValue placeholder="Año del avance" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="">Todos los años</SelectItem>
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Trimestre */}
      <Select
        value={filters.trimestre ?? ''}
        onValueChange={handleChange('trimestre')}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <div className="flex items-center gap-1 truncate">
            <Filter className="h-3 w-3 shrink-0" />
            <SelectValue placeholder="Trimestre del avance" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="">Todos los trimestres</SelectItem>
          {TRIMESTRES.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Responsable */}
      <FilterSelect
        label="Responsables"
        value={filters.responsable}
        onChange={handleChange('responsable')}
        options={responsables}
        placeholder="Responsable"
        isObject={true}
        valueKey="id"
        labelKey="nombre"
      />
    </motion.div>
  );
};

export default ReportFilters;
