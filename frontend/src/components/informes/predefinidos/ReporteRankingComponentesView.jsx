import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ReporteRankingComponentesView = ({ data, onClose }) => {
    if (!data) return null;

    const { plan, ranking } = data;

    const handlePrint = () => {
        window.print();
    };

    // Función para determinar el estilo de la fila basado en el porcentaje
    const getRowStyle = (p) => {
        // Colores solicitados:
        // 0% -> Negro (texto blanco)
        // < 26.25% -> Rojo
        // < 43.75% -> Naranja
        // < 100% -> Amarillo
        // 100% -> Verde
        if (p === 0) return 'bg-black text-white hover:bg-gray-800';
        if (p < 26.25) return 'bg-red-600 text-white hover:bg-red-700';
        if (p < 43.75) return 'bg-orange-500 text-white hover:bg-orange-600';
        if (p < 100) return 'bg-yellow-400 text-black hover:bg-yellow-500';
        return 'bg-green-600 text-white hover:bg-green-700';
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-auto animate-in fade-in duration-300">
            {/* Toolbar No Imprimible */}
            <div className="sticky top-0 z-10 bg-gray-100 p-4 border-b flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">4. Ranking por Componente</h2>
                    <p className="text-gray-500 text-sm">Ordenado por porcentaje de avance (descendente)</p>
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

            {/* Contenido Imprimible */}
            <div className="p-8 max-w-5xl mx-auto bg-white print:p-0 print:max-w-none">

                {/* Cabecera del Reporte */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold uppercase mb-2">RANKING DE COMPONENTES POR AVANCE</h1>
                    <h2 className="text-xl font-semibold">{plan.nombre_plan || plan.nombre}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        PERIODO: {plan.vigencia_inicio || plan.fecha_inicio} - {plan.vigencia_fin || plan.fecha_fin}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 print:hidden">
                        Total de Componentes listados: {ranking.length}
                    </p>
                </div>

                {/* Tabla de Ranking */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 shadow-sm print:shadow-none print:border-gray-800">
                        <thead className="bg-gray-100 text-gray-700 print:bg-gray-200">
                            <tr>
                                <th className="border p-3 text-left w-16 text-center">#</th>
                                <th className="border p-3 text-left">Secretaría (Responsable)</th>
                                <th className="border p-3 text-left">Componente</th>
                                <th className="border p-3 text-center w-24">Metas</th>
                                <th className="border p-3 text-center w-32">% Avance</th>
                                <th className="border p-3 text-center w-24">Progreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((item, index) => (
                                <tr key={item.componente_id} className={`border-b transition-colors ${getRowStyle(item.avance_porcentaje)}`}>
                                    <td className="border border-white/20 p-3 text-center font-bold">
                                        {index + 1}
                                    </td>
                                    <td className="border border-white/20 p-3 font-medium">
                                        {item.secretaria_nombre}
                                    </td>
                                    <td className="border border-white/20 p-3">
                                        {item.componente_nombre}
                                    </td>
                                    <td className="border border-white/20 p-3 text-center">
                                        {item.metas_count}
                                    </td>
                                    <td className="border border-white/20 p-3 text-center font-bold text-lg">
                                        {item.avance_porcentaje}%
                                    </td>
                                    <td className="border border-white/20 p-3 text-center align-middle">
                                        {/* Barra de progreso visual simple (color ya está en la fila) */}
                                        <div className="w-full bg-white/30 h-3 rounded-full overflow-hidden border border-white/40">
                                            <div
                                                className="h-full bg-white transition-all duration-500"
                                                style={{ width: `${item.avance_porcentaje}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ranking.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="border p-6 text-center text-gray-500 bg-white">
                                        No hay datos disponibles para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Impresión */}
                <div className="mt-8 text-center text-[10px] text-gray-400 border-t pt-2 hidden print:block">
                    Reporte generado el {new Date().toLocaleString()}
                </div>
            </div>

            {/* Estilos para impresión */}
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
                }
            `}</style>
        </div>
    );
};

export default ReporteRankingComponentesView;
