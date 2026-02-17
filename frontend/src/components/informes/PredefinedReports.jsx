import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Filter, Loader2 } from 'lucide-react';
import { usePlan } from "@/context/PlanContext";
import { useReportes } from "@/context/ReportesContext";
import ReporteGeneralView from './predefinidos/ReporteGeneralView';
import ReporteLineasView from './predefinidos/ReporteLineasView';
import ReporteComponentesView from './predefinidos/ReporteComponentesView';
import ReporteSecretariasView from './predefinidos/ReporteSecretariasView';

const PredefinedReports = () => {
    const [reportType, setReportType] = useState('');
    const [year, setYear] = useState('');
    const [quarter, setQuarter] = useState('');

    const REPORT_OPTIONS = [
        { id: 'general', label: '1. Reporte de metas General con grafico circular' },
        { id: 'lineas', label: '2. Reporte de metas por lineas con grafico circular' },
        { id: 'componente', label: '3. Reporte de metas por componente con grafico circular' },
        { id: 'ranking_componente', label: '4. Reporte de Ranking por componente' },
        { id: 'secretaria', label: '5. Reporte de metas por secretaria con grafico circular' },
        { id: 'ranking_dependencia', label: '6. Reporte de Ranking por dependencia' },
        { id: 'arbol', label: '7. Arbol de metas general' },
    ];

    const YEARS = [2024, 2025, 2026, 2027];

    const TRIMESTRES = [
        { id: 'T1', nombre: 'Trimestre 1' },
        { id: 'T2', nombre: 'Trimestre 2' },
        { id: 'T3', nombre: 'Trimestre 3' },
        { id: 'T4', nombre: 'Trimestre 4' },
    ];

    const { activePlanId } = usePlan();
    const {
        generateGeneralReport,
        generateLineasReport,
        generateComponentesReport,
        generateSecretariasReport,
        loadingReport,
        reportData,
        setReportData
    } = useReportes();

    const handleGenerate = async () => {
        if (!activePlanId) {
            alert('Seleccione un plan activo primero.');
            return;
        }

        if (reportType === 'general') {
            await generateGeneralReport({
                idPlan: activePlanId,
                year,
                quarter
            });
        } else if (reportType === 'lineas') {
            await generateLineasReport({
                idPlan: activePlanId,
                year,
                quarter
            });
        } else if (reportType === 'componente') {
            await generateComponentesReport({
                idPlan: activePlanId,
                year,
                quarter
            });
        } else if (reportType === 'secretaria') {
            await generateSecretariasReport({
                idPlan: activePlanId,
                year,
                quarter
            });
        } else {
            alert('Esta opción aún está en desarrollo.');
        }
    };

    const isLoading = loadingReport;

    // Si hay datos del reporte y es tipo general, mostramos la vista previa
    if (reportData && reportType === 'general') {
        return (
            <ReporteGeneralView
                data={reportData}
                onClose={() => setReportData(null)}
            />
        );
    }

    if (reportData && reportType === 'lineas') {
        return (
            <ReporteLineasView
                data={reportData}
                onClose={() => setReportData(null)}
            />
        );
    }

    if (reportData && reportType === 'componente') {
        return (
            <ReporteComponentesView
                data={reportData}
                onClose={() => setReportData(null)}
            />
        );
    }

    if (reportData && reportType === 'secretaria') {
        return (
            <ReporteSecretariasView
                data={reportData}
                onClose={() => setReportData(null)}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* A. Select Principal (50%) */}
                <div className="w-full lg:w-1/2">
                    <label className="text-sm font-medium mb-1 block">Tipo de Reporte</label>
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 truncate">
                                <FileText className="h-4 w-4 shrink-0" />
                                <SelectValue placeholder="Seleccione un reporte..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {REPORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* B. Año (25%) */}
                <div className="w-full lg:w-1/4">
                    <label className="text-sm font-medium mb-1 block">Año de Corte</label>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 truncate">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <SelectValue placeholder="Año" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* C. Trimestre (25%) */}
                <div className="w-full lg:w-1/4">
                    <label className="text-sm font-medium mb-1 block">Trimestre</label>
                    <Select value={quarter} onValueChange={setQuarter}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 truncate">
                                <Filter className="h-4 w-4 shrink-0" />
                                <SelectValue placeholder="Trimestre de corte" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {TRIMESTRES.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* D. Botón Generar */}
            <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={!reportType || !year || !quarter || isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generar Reporte
                </Button>
            </div>
        </div>
    );
};

export default PredefinedReports;
