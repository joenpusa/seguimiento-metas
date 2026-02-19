import React, { createContext, useContext, useState } from 'react';
import api from '@/api/axiosConfig';
import { useToast } from '@/components/ui/use-toast';

const ReportesContext = createContext();

export const ReportesProvider = ({ children }) => {
    const { toast } = useToast();
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportData, setReportData] = useState(null);

    // ===============================
    // GENERAR REPORTE GENERAL
    // ===============================
    const generateGeneralReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null); // Limpiar data previa
        try {
            const response = await api.post(
                '/reports/general',
                { idPlan, year, quarter }
            );

            // Almacenar data en el estado para mostrarla en el componente
            setReportData(response.data);

            toast({ title: 'Reporte generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando reporte:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el reporte.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    // ===============================
    // GENERAR REPORTE LINEAS
    // ===============================
    const generateLineasReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/lineas',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Reporte por líneas generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando reporte líneas:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el reporte.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    // ===============================
    // GENERAR REPORTE COMPONENTES
    // ===============================
    const generateComponentesReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/componentes',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Reporte por componentes generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando reporte componentes:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el reporte por componentes.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    // ===============================
    // GENERAR REPORTE SECRETARIAS
    // ===============================
    const generateSecretariasReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/secretarias',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Reporte por secretarías generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando reporte secretarías:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el reporte por secretarías.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };


    // ===============================
    // GENERAR REPORTE ARBOL
    // ===============================
    const generateArbolReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/arbol',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Reporte árbol generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando reporte árbol:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el reporte árbol.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    // ===============================
    // GENERAR REPORTE RANKING COMPONENTES
    // ===============================
    const generateRankingComponentesReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/ranking-componentes',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Ranking generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando ranking:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el ranking.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    // ===============================
    // GENERAR REPORTE RANKING SECRETARIAS
    // ===============================
    const generateRankingSecretariasReport = async (filters) => {
        const { idPlan, year, quarter } = filters;
        if (!idPlan || !year || !quarter) return;

        setLoadingReport(true);
        setReportData(null);
        try {
            const response = await api.post(
                '/reports/ranking-secretarias',
                { idPlan, year, quarter }
            );
            setReportData(response.data);
            toast({ title: 'Ranking generado correctamente' });
            return true;
        } catch (error) {
            console.error('Error generando ranking secretarias:', error);
            toast({
                title: 'Error',
                description: 'No se pudo generar el ranking.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <ReportesContext.Provider
            value={{
                generateGeneralReport,
                generateLineasReport,
                generateComponentesReport,
                generateSecretariasReport,
                generateArbolReport,
                generateRankingComponentesReport,
                generateRankingSecretariasReport,
                loadingReport,
                reportData,
                setReportData
            }}
        >
            {children}
        </ReportesContext.Provider>
    );
};

export const useReportes = () => {
    const ctx = useContext(ReportesContext);
    if (!ctx) throw new Error('useReportes debe usarse dentro de ReportesProvider');
    return ctx;
};
