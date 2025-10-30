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

const ESTADO_PROGRESO_OPTIONS = [
  { id: 'sinIniciar', nombre: 'Sin Iniciar (0%)' },
  { id: 'enProgreso', nombre: 'En Progreso (1-99%)' },
  { id: 'completada', nombre: 'Completada (100%)' },
];

const MetasFilterControls = ({ searchTerm, setSearchTerm, filters, setFilters, listaResponsables, listaMunicipios, currentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
    >
      <div className="relative md:col-span-2 lg:col-span-1">
        <Label htmlFor="searchMeta" className="sr-only">Buscar</Label>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="searchMeta"
          placeholder="Buscar por nombre, descripción o número..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
          <Label htmlFor="filterResponsableMeta" className="text-xs text-muted-foreground">Responsable</Label>
          <Select 
            value={filters.responsable} 
            onValueChange={(value) => setFilters(prev => ({...prev, responsable: value}))}
            disabled={currentUser && currentUser.rol === 'responsable'}
          >
              <SelectTrigger id="filterResponsableMeta" className="w-full">
                  <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {listaResponsables.map(responsable => (
                      <SelectItem key={responsable.id} value={responsable.nombre}>{responsable.nombre}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
      <div>
          <Label htmlFor="filterMunicipioMeta" className="text-xs text-muted-foreground">Municipio</Label>
          <Select value={filters.municipio} onValueChange={(value) => setFilters(prev => ({...prev, municipio: value}))}>
              <SelectTrigger id="filterMunicipioMeta" className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {listaMunicipios.map(municipio => (
                      <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
      <div>
          <Label htmlFor="filterEstadoProgreso" className="text-xs text-muted-foreground">Estado de Progreso</Label>
          <Select value={filters.estadoProgreso} onValueChange={(value) => setFilters(prev => ({...prev, estadoProgreso: value}))}>
              <SelectTrigger id="filterEstadoProgreso" className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {ESTADO_PROGRESO_OPTIONS.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.nombre}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
    </motion.div>
  );
};

export default MetasFilterControls;