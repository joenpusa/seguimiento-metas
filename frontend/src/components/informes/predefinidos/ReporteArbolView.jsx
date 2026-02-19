import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronDown, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Función para aplanar el árbol a una lista para la impresión
const flattenTree = (nodes, level = 0, result = []) => {
    nodes.forEach(node => {
        result.push({ ...node, level });
        if (node.children && node.children.length > 0) {
            flattenTree(node.children, level + 1, result);
        }
    });
    return result;
};

// Componente Nodo para la Vista en Pantalla (Interactivo)
const TreeNode = ({ node, level }) => {
    const [expanded, setExpanded] = useState(true);

    const hasChildren = node.children && node.children.length > 0;

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

    const handlePrint = () => {
        window.print();
    };

    // Aplanar datos para la tabla de impresión
    const flatData = flattenTree(arbol);

    // Colores de fondo para la tabla de impresión según nivel
    const getPrintRowStyle = (level, porcentaje) => {
        let baseClass = "border-b border-gray-300 text-sm ";
        if (level === 0) baseClass += "bg-gray-200 font-bold "; // Linea
        else if (level === 1) baseClass += "bg-gray-100 font-semibold "; // Componente
        else if (level === 4) baseClass += "bg-white "; // Meta
        else baseClass += "bg-gray-50 "; // Otros
        return baseClass;
    };

    const getProgressColorPrint = (p) => {
        if (p >= 100) return 'text-green-700 font-bold';
        if (p >= 70) return 'text-emerald-600 font-bold';
        if (p >= 40) return 'text-yellow-600 font-bold';
        return 'text-red-600 font-bold';
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
            {/* Toolbar No Imprimible */}
            <div className="sticky top-0 z-10 bg-gray-100 p-4 border-b flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Vista Previa: Arbol de Metas</h2>
                    <p className="text-gray-500 text-sm">Jerarquía completa y avances</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir / Guardar PDF
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-4 w-4" />
                        Cerrar
                    </Button>
                </div>
            </div>

            {/* ---------- VISTA PANTALLA (INTERACTIVA) ---------- */}
            <div className="p-6 max-w-7xl mx-auto print:hidden">
                {/* Info del Plan */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Información del Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><span className="font-bold">Plan:</span> {plan.nombre_plan || plan.nombre}</p>
                            <p><span className="font-bold">Periodo:</span> {plan.vigencia_inicio || plan.fecha_inicio} - {plan.vigencia_fin || plan.fecha_fin}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Arbol Interactivo */}
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

            {/* ---------- VISTA IMPRESIÓN (TABLA PLANA) ---------- */}
            <div className="hidden print:block p-8 bg-white max-w-[210mm] mx-auto">
                {/* Cabecera Impresión */}
                <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">REPORTE DE METAS (ARBOL JERÁRQUICO)</h1>
                    <h2 className="text-xl font-semibold">{plan.nombre_plan || plan.nombre}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        PERIODO: {plan.vigencia_inicio || plan.fecha_inicio} - {plan.vigencia_fin || plan.fecha_fin}
                    </p>
                </div>

                {/* Tabla */}
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-2 text-left w-1/2">Jerarquía / Meta</th>
                            <th className="border p-2 text-center w-24">Código</th>
                            <th className="border p-2 text-center w-24">Tipo</th>
                            <th className="border p-2 text-right w-24">Meta Total</th>
                            <th className="border p-2 text-right w-24">Avance</th>
                            <th className="border p-2 text-center w-20">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flatData.map((row, idx) => {
                            const paddingLeft = `${row.level * 15}px`;
                            const isMeta = row.type === 'meta';

                            return (
                                <tr key={idx} className={getPrintRowStyle(row.level)}>
                                    <td className="border p-2" style={{ paddingLeft }}>
                                        {/* Indicador visual de jerarquia */}
                                        <span className="mr-1 text-gray-400">{'>'.repeat(row.level)}</span>
                                        {row.nombre}
                                    </td>
                                    <td className="border p-2 text-center text-gray-600">{row.codigo || '-'}</td>
                                    <td className="border p-2 text-center uppercase text-[10px] text-gray-500">{row.type}</td>
                                    <td className="border p-2 text-right">
                                        {isMeta ? row.unidad_meta : '-'}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {isMeta ? row.avance_meta : '-'}
                                    </td>
                                    <td className={`border p-2 text-center ${getProgressColorPrint(row.avance_porcentaje)}`}>
                                        {row.avance_porcentaje}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer Impresión */}
                <div className="mt-8 text-center text-[10px] text-gray-400 border-t pt-2">
                    Reporte generado el {new Date().toLocaleString()}
                </div>
            </div>

            {/* Estilos Globales Impresión */}
            <style jsx="true" global="true">{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4 portrait;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReporteArbolView;
