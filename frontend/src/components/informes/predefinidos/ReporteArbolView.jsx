import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReportSummary from '../ReportSummary';

const TreeNode = ({ node, level }) => {
    const [expanded, setExpanded] = useState(true);

    const hasChildren = node.children && node.children.length > 0;
    const isMeta = node.type === 'meta';

    // Colores por nivel para distinguir visualmente
    const levelColors = {
        0: 'bg-blue-50 border-blue-200', // Linea
        1: 'bg-indigo-50 border-indigo-200', // Componente
        2: 'bg-purple-50 border-purple-200', // Apuesta
        3: 'bg-pink-50 border-pink-200', // Iniciativa
        4: 'bg-white border-gray-100', // Meta
    };

    const bgColor = levelColors[level] || 'bg-white';

    // Función para determinar color del badge de porcentaje
    const getProgressColor = (p) => {
        if (p >= 100) return 'bg-green-500 hover:bg-green-600';
        if (p >= 70) return 'bg-emerald-500 hover:bg-emerald-600';
        if (p >= 40) return 'bg-yellow-500 hover:bg-yellow-600';
        return 'bg-red-500 hover:bg-red-600';
    };

    return (
        <div className={`mb-2 pl-${level > 0 ? '4' : '0'}`}>
            <div
                className={`flex items-center p-3 rounded-lg border ${bgColor} transition-colors hover:shadow-sm cursor-pointer`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="mr-2 text-gray-500">
                    {hasChildren ? (
                        expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
                    ) : (
                        <div className="w-5" /> // Spacer
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider mr-2">
                                {node.type}
                            </span>
                            <span className="font-medium text-gray-900">
                                {node.codigo ? `${node.codigo} - ` : ''} {node.nombre}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className={`h-2.5 rounded-full ${getProgressColor(node.avance_porcentaje).split(' ')[0]}`}
                                    style={{ width: `${Math.min(node.avance_porcentaje, 100)}%` }}
                                ></div>
                            </div>
                            <Badge className={`${getProgressColor(node.avance_porcentaje)} text-white w-16 justify-center`}>
                                {node.avance_porcentaje}%
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="mt-2 border-l-2 border-gray-100 ml-3 pl-1">
                    {node.children.map((child, idx) => (
                        <TreeNode key={`${child.type}-${child.id}-${idx}`} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ReporteArbolView = ({ data, onClose }) => {
    if (!data) return null;

    const { plan, arbol } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Resumen */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">7. Arbol de Metas General</h2>
                    <p className="text-gray-500 text-sm">Jerarquía completa y avances acumulados</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Info del Plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Información del Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><span className="font-bold">Plan:</span> {plan.nombre}</p>
                        <p><span className="font-bold">Periodo:</span> {plan.periodo_inicio} - {plan.periodo_fin}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Arbol */}
            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[500px]">
                {arbol.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No hay datos jerárquicos para mostrar.
                    </div>
                ) : (
                    arbol.map((linea, idx) => (
                        <div key={`root-${idx}`} className="mb-6">
                            <TreeNode node={linea} level={0} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReporteArbolView;
