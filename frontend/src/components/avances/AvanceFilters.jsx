import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const TRIMESTRES_OPTIONS = [
    { id: 'T1', nombre: 'Trimestre 1' }, { id: 'T2', nombre: 'Trimestre 2' },
    { id: 'T3', nombre: 'Trimestre 3' }, { id: 'T4', nombre: 'Trimestre 4' },
];

const AvanceFilters = ({ searchTerm, setSearchTerm, filters, setFilters, metas, availableYears, listaResponsables, currentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
    >
      <div className="relative lg:col-span-2">
        <Label htmlFor="searchAvance" className="sr-only">Buscar</Label>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="searchAvance"
          placeholder="Buscar por descripción, nombre o número de meta..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
          <Label htmlFor="filterMeta" className="text-xs text-muted-foreground">Filtrar por Meta</Label>
          <Select value={filters.metaId} onValueChange={(value) => setFilters(prev => ({...prev, metaId: value}))}>
              <SelectTrigger id="filterMeta" className="w-full">
                  <SelectValue placeholder="Meta" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todas las metas</SelectItem>
                  {metas.map(meta => (
                      <SelectItem key={meta.idMeta} value={meta.idMeta}>{meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
      <div>
          <Label htmlFor="filterResponsable" className="text-xs text-muted-foreground">Filtrar por Responsable</Label>
          <Select 
            value={filters.responsableId} 
            onValueChange={(value) => setFilters(prev => ({...prev, responsableId: value}))}
            disabled={currentUser && currentUser.rol === 'responsable'}
          >
              <SelectTrigger id="filterResponsable" className="w-full">
                  <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {listaResponsables.map(responsable => (
                      <SelectItem key={responsable.id} value={responsable.nombre}>{responsable.nombre}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
          <div>
              <Label htmlFor="filterAnio" className="text-xs text-muted-foreground">Año</Label>
              <Select value={filters.anio} onValueChange={(value) => setFilters(prev => ({...prev, anio: value}))}>
                  <SelectTrigger id="filterAnio" className="w-full"><SelectValue placeholder="Año" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {availableYears.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>
          <div>
              <Label htmlFor="filterTrimestre" className="text-xs text-muted-foreground">Trimestre</Label>
              <Select value={filters.trimestre} onValueChange={(value) => setFilters(prev => ({...prev, trimestre: value}))}>
                  <SelectTrigger id="filterTrimestre" className="w-full"><SelectValue placeholder="Trimestre" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {TRIMESTRES_OPTIONS.map(trim => <SelectItem key={trim.id} value={trim.id}>{trim.nombre}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>
      </div>
    </motion.div>
  );
};

export default AvanceFilters;