import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  User, 
  Calendar, 
  Target, 
  DollarSign, 
  TrendingUp,
  Eye,
  CalendarPlus
} from 'lucide-react';
import MetaForm from '@/components/MetaForm';
import ProgramacionTrimestralForm from '@/components/ProgramacionTrimestralForm';
import ProgramacionTrimestralList from '@/components/ProgramacionTrimestralList';
import { usePlan } from '@/context/PlanContext';
import { useAuth } from '@/context/AuthContext';

const MetaCard = ({ meta, viewMode = 'grid' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showProgramacion, setShowProgramacion] = useState(false);
  const [showProgramacionList, setShowProgramacionList] = useState(false);
  const { getActivePlan, programarTrimestre } = usePlan();
  const { currentUser } = useAuth();
  
  const activePlan = getActivePlan();

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (progress) => {
    if (progress === 0) return <Badge variant="secondary">Sin iniciar</Badge>;
    if (progress < 100) return <Badge variant="default">En progreso</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-700">Completada</Badge>;
  };

  const handleProgramarTrimestre = (programacionData) => {
    programarTrimestre(meta.idMeta, programacionData);
    setShowProgramacion(false);
  };

  const canManageProgramacion = () => {
    if (!currentUser) return false;
    if (currentUser.rol === 'admin') return true;
    if (currentUser.rol === 'responsable' && meta.responsable === currentUser.nombre) return true;
    return false;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const presupuestoTotal = meta.presupuestoAnual?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {meta.numeroMetaManual && (
                        <span className="text-primary mr-2">({meta.numeroMetaManual})</span>
                      )}
                      {meta.nombreMeta}
                    </h3>
                    {getStatusBadge(meta.progreso || 0)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="truncate">{meta.responsable}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{meta.municipios?.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(meta.fechaLimite).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Progress 
                        value={meta.progreso || 0} 
                        className="h-2 flex-1"
                        indicatorClassName={getProgressColor(meta.progreso || 0)}
                      />
                      <span className="text-sm font-medium">{meta.progreso || 0}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {meta.cantidad} {meta.unidadMedida}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowDetails(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManageProgramacion() && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowProgramacionList(true)}
                          className="h-8 w-8 p-0"
                          title="Ver programación"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowProgramacion(true)}
                          className="h-8 w-8 p-0"
                          title="Programar trimestre"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <MetaForm 
          open={showDetails} 
          onOpenChange={setShowDetails} 
          metaToEdit={meta}
          onSave={() => {}}
        />

        <ProgramacionTrimestralForm
          open={showProgramacion}
          onOpenChange={setShowProgramacion}
          onSave={handleProgramarTrimestre}
          meta={meta}
          activePlan={activePlan}
        />

        {showProgramacionList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Programación - {meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}
                </h2>
              </div>
              <div className="p-4">
                <ProgramacionTrimestralList 
                  meta={meta} 
                  onProgramar={() => {
                    setShowProgramacionList(false);
                    setShowProgramacion(true);
                  }}
                />
              </div>
              <div className="p-4 border-t">
                <Button onClick={() => setShowProgramacionList(false)} className="w-full">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">
                  {meta.numeroMetaManual && (
                    <span className="text-primary block text-sm font-normal mb-1">
                      Meta {meta.numeroMetaManual}
                    </span>
                  )}
                  <span className="line-clamp-2">{meta.nombreMeta}</span>
                </CardTitle>
              </div>
              {getStatusBadge(meta.progreso || 0)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{meta.progreso || 0}%</span>
              </div>
              <Progress 
                value={meta.progreso || 0} 
                className="h-2"
                indicatorClassName={getProgressColor(meta.progreso || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{meta.cantidad} {meta.unidadMedida}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-xs">{formatCurrency(presupuestoTotal)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{meta.responsable}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{meta.municipios?.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{new Date(meta.fechaLimite).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDetails(true)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              {canManageProgramacion() && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProgramacionList(true)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Prog.
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProgramacion(true)}
                    className="flex-1"
                  >
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    +
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <MetaForm 
        open={showDetails} 
        onOpenChange={setShowDetails} 
        metaToEdit={meta}
        onSave={() => {}}
      />

      <ProgramacionTrimestralForm
        open={showProgramacion}
        onOpenChange={setShowProgramacion}
        onSave={handleProgramarTrimestre}
        meta={meta}
        activePlan={activePlan}
      />

      {showProgramacionList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Programación - {meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}
              </h2>
            </div>
            <div className="p-4">
              <ProgramacionTrimestralList 
                meta={meta} 
                onProgramar={() => {
                  setShowProgramacionList(false);
                  setShowProgramacion(true);
                }}
              />
            </div>
            <div className="p-4 border-t">
              <Button onClick={() => setShowProgramacionList(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetaCard;