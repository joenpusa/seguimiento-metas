import React from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const FilterSelect = ({ label, value, onChange, options, placeholder, disabled = false, isObject = true }) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="w-full text-xs h-9">
      <div className="flex items-center gap-1 truncate">
        <Filter className="h-3 w-3 flex-shrink-0" />
        <SelectValue placeholder={placeholder} />
      </div>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">{`Todos ${label.toLowerCase()}`}</SelectItem>
      {Array.isArray(options) && options.map(opt => (
        <SelectItem key={isObject ? opt.nombre : opt} value={isObject ? opt.nombre : opt}>
          {isObject ? opt.nombre : opt}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ReportFilters = ({
  filters,
  onFilterChange,
  municipios = [],
  responsables = []
}) => {
  const handleFilterChange = (filterName, value) => {
    onFilterChange({ [filterName]: value });
  };

  const TRIMESTRES_OPTIONS = [
    { id: 'T1', nombre: 'Trimestre 1' },
    { id: 'T2', nombre: 'Trimestre 2' },
    { id: 'T3', nombre: 'Trimestre 3' },
    { id: 'T4', nombre: 'Trimestre 4' }
  ];

  const availableYears = [2024, 2025, 2026, 2027];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      <FilterSelect
        label="Municipios"
        value={filters.municipio}
        onChange={(v) => handleFilterChange('municipio', v)}
        options={municipios}
        placeholder="Municipio"
        isObject={false}
      />

      <Select value={filters.anio} onValueChange={(v) => handleFilterChange('anio', v)}>
        <SelectTrigger className="w-full text-xs h-9">
          <div className="flex items-center gap-1 truncate">
            <Filter className="h-3 w-3 flex-shrink-0" />
            <SelectValue placeholder="Año Avance" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los Años</SelectItem>
          {availableYears.map(year => (
            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.trimestre} onValueChange={(v) => handleFilterChange('trimestre', v)}>
        <SelectTrigger className="w-full text-xs h-9">
          <div className="flex items-center gap-1 truncate">
            <Filter className="h-3 w-3 flex-shrink-0" />
            <SelectValue placeholder="Trimestre Avance" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los Trimestres</SelectItem>
          {TRIMESTRES_OPTIONS.map(trim => (
            <SelectItem key={trim.id} value={trim.id}>{trim.nombre}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FilterSelect
        label="Responsables"
        value={filters.responsable}
        onChange={(v) => handleFilterChange('responsable', v)}
        options={responsables}
        placeholder="Responsable"
        isObject={true}
      />
    </motion.div>
  );
};

export default ReportFilters;