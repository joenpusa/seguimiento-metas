import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const SectionReporte = ({ componente, totalMetasGlobal }) => {
    const { counts, metas, nombre } = componente;
    const totalMetas = metas.length;

    const chartData = [
        { name: '0%', value: counts.rango0, color: '#000000' },
        { name: '< 26.25%', value: counts.rango_low, color: '#D32F2F' },
        { name: '26.25% - 43.75%', value: counts.rango_mid, color: '#F57C00' },
        { name: '> 43.75%', value: counts.rango_high, color: '#FBC02D' },
        { name: '100%', value: counts.rango100, color: '#388E3C' },
    ].filter(d => d.value > 0);

    const getPct = (cnt) => totalMetas > 0 ? ((cnt / totalMetas) * 100).toFixed(2) + '%' : '0%';

    return (
        <div className="mb-12 break-inside-avoid border-b pb-8 last:border-0">
            <h2 className="text-xl font-bold mb-4 uppercase text-purple-800 border-l-4 border-purple-800 pl-2">{nombre}</h2>

            {/* Tabla de Distribución */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="text-white">
                            <th className="border p-2 bg-black">0%</th>
                            <th className="border p-2 bg-red-600">&lt; 26.25%</th>
                            <th className="border p-2 bg-orange-600">26.25% - &lt; 43.75%</th>
                            <th className="border p-2 bg-yellow-400 text-black">&gt;= 43.75%</th>
                            <th className="border p-2 bg-green-700">100%</th>
                            <th className="border p-2 bg-gray-300 text-black">TOTAL METAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center font-bold">
                            <td className="border p-2">{counts.rango0}</td>
                            <td className="border p-2">{counts.rango_low}</td>
                            <td className="border p-2">{counts.rango_mid}</td>
                            <td className="border p-2">{counts.rango_high}</td>
                            <td className="border p-2">{counts.rango100}</td>
                            <td className="border p-2 text-lg">{totalMetas}</td>
                        </tr>
                        <tr className="text-center text-gray-600 italic">
                            <td className="border p-2">{getPct(counts.rango0)}</td>
                            <td className="border p-2">{getPct(counts.rango_low)}</td>
                            <td className="border p-2">{getPct(counts.rango_mid)}</td>
                            <td className="border p-2">{getPct(counts.rango_high)}</td>
                            <td className="border p-2">{getPct(counts.rango100)}</td>
                            <td className="border p-2">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Gráfica */}
            <div className="flex flex-col items-center justify-center">
                <div className="h-64 w-full max-w-lg relative">
                    {totalMetas === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Sin datos para graficar</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Texto Central Total */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-700">{totalMetas}</span>
                                <div className="text-[10px] text-gray-500">METAS</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReporteComponentesView = ({ data, onClose }) => {
    if (!data) return null;

    const { plan, componentes } = data;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
            {/* Toolbar No Imprimible */}
            <div className="sticky top-0 z-10 bg-gray-100 p-4 border-b flex justify-between items-center print:hidden">
                <h2 className="text-xl font-bold text-gray-800">Vista Previa: Reporte por Componente</h2>
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
            <div className="print:w-full max-w-[210mm] mx-auto p-[20mm] bg-white print:p-0 print:m-0">

                {/* Cabecera Principal */}
                <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">PLAN DE DESARROLLO: {plan.nombre_plan || plan.nombre}</h1>
                    <p className="text-sm">
                        PERIODO: {plan.vigencia_inicio || new Date(plan.fecha_inicio).getFullYear()} - {plan.vigencia_fin || new Date(plan.fecha_fin).getFullYear()}
                    </p>
                    <p className="text-sm font-semibold mt-2">REPORTE CONSOLIDADO POR COMPONENTE</p>
                </div>

                {/* Iteración de Componentes */}
                {componentes.map((comp, idx) => (
                    <SectionReporte key={idx} componente={comp} />
                ))}

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4 break-before-avoid">
                    Generado automáticamente por el Sistema de Seguimiento de Metas - {new Date().toLocaleString()}
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
                    }
                }
            `}</style>
        </div>
    );
};

export default ReporteComponentesView;
