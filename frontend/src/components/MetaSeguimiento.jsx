import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useMeta } from "@/context/MetaContext";
import { Badge } from "@/components/ui/badge";

const MetaSeguimiento = ({ metaId, open, onOpenChange }) => {
    const { getMetaSeguimiento } = useMeta();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (open && metaId) {
            loadData();
        } else {
            setData(null);
        }
    }, [open, metaId]);

    const loadData = async () => {
        setLoading(true);
        const result = await getMetaSeguimiento(metaId);
        setData(result);
        setLoading(false);
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(val || 0);

    const formatNumber = (val) =>
        new Intl.NumberFormat("es-CO").format(val || 0);

    const handleExport = () => {
        if (!data || !data.detalles) return;

        // Hiearchy Headers
        const hierarchyHeaders = [
            "Linea Codigo", "Linea Nombre",
            "Componente Codigo", "Componente Nombre",
            "Apuesta Codigo", "Apuesta Nombre",
            "Iniciativa Codigo", "Iniciativa Nombre"
        ];

        const hierarchyRow = [
            data.meta.linea?.codigo || "", data.meta.linea?.nombre || "",
            data.meta.componente?.codigo || "", data.meta.componente?.nombre || "",
            data.meta.apuesta?.codigo || "", data.meta.apuesta?.nombre || "",
            data.meta.iniciativa?.codigo || "", data.meta.iniciativa?.nombre || ""
        ];


        const headers = [
            ...hierarchyHeaders,
            "Año",
            "Trimestre",
            "Prog. Cantidad",
            "Prog. Gastos Total",
            "Prog. Propio", "Prog. Credito", "Prog. SGP", "Prog. Regalias", "Prog. Municipal", "Prog. Otros",
            "Avance Cantidad",
            "% Cumplimiento Fisico",
            "Avance Gastos Total",
            "% Eje. Financiera",
            "Av. Propio", "Av. Credito", "Av. SGP", "Av. Regalias", "Av. Municipal", "Av. Otros",
            "Pob. Total Reportada",
            "Mujeres",
            "Discapacidad",
            "Etnia",
            "Victimas",
            "LGTBI",
            "Migrantes",
            "0-5 años",
            "6-12 años",
            "13-17 años",
            "18-24 años",
            "25-62 años",
            "65+ años",
        ];

        const rows = data.detalles.map((d) => [
            ...hierarchyRow,
            d.anio,
            d.trimestre,
            d.programacion_cantidad,
            d.programacion_gastos,
            d.prog_gasto_pro, d.prog_gasto_cre, d.prog_gasto_sgp, d.prog_gasto_reg, d.prog_gasto_mun, d.prog_gasto_otr,
            d.avance_cantidad,
            d.porcentaje_cumplimiento_fisico,
            d.avance_gastos,
            d.porcentaje_cumplimiento_financiero,
            d.av_gasto_pro, d.av_gasto_cre, d.av_gasto_sgp, d.av_gasto_reg, d.av_gasto_mun, d.av_gasto_otr,
            d.poblacion_total_reportada,
            d.cantesp_mujer,
            d.cantesp_discapacidad,
            d.cantesp_etnia,
            d.cantesp_victima,
            d.cantesp_lgtbi,
            d.cantesp_migrante,
            d.cantidad_0_5,
            d.cantidad_6_12,
            d.cantidad_13_17,
            d.cantidad_18_24,
            d.cantidad_25_62,
            d.cantidad_65_mas,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `seguimiento_meta_${data.meta.codigo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80vw] max-w-[80vw] h-[90vh] flex flex-col p-0 gap-0 sm:max-w-[80vw]">
                <DialogHeader className="p-4 bg-background border-b shadow-sm shrink-0">
                    <DialogTitle className="flex justify-between items-center text-xl">
                        <span>Seguimiento de Meta</span>
                        {data && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="gap-2 mr-8"
                            >
                                <Download className="h-4 w-4" />
                                Exportar CSV
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-4 bg-muted/20">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* DATOS BÁSICOS & JERARQUIA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card rounded-lg border shadow-sm">
                                <div className="bg-muted/10 p-2 rounded">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                                        Meta
                                    </label>
                                    <div className="font-bold text-base">{data.meta.codigo}</div>
                                    <div className="text-sm line-clamp-3" title={data.meta.nombre}>
                                        {data.meta.nombre}
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Jerarquia */}
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Línea</label>
                                        <div className="text-xs">{data.meta.linea?.codigo} - {data.meta.linea?.nombre}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Componente</label>
                                        <div className="text-xs">{data.meta.componente?.codigo} - {data.meta.componente?.nombre}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Apuesta</label>
                                        <div className="text-xs">{data.meta.apuesta?.codigo} - {data.meta.apuesta?.nombre}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Iniciativa</label>
                                        <div className="text-xs">{data.meta.iniciativa?.codigo} - {data.meta.iniciativa?.nombre}</div>
                                    </div>

                                    {/* Detalles */}
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Unidad de Medida</label>
                                        <div className="text-xs font-medium">{data.meta.unidad_nombre}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Responsable</label>
                                        <div className="text-xs font-medium">{data.meta.secretaria_nombre}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Meta Total (Cuatrienio)</label>
                                        <div className="text-xs font-medium">{formatNumber(data.meta.cantidad)}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">Presupuesto Total</label>
                                        <div className="text-xs font-medium">{formatCurrency(data.meta.presupuestoTotal)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* TABLA DETALLADA */}
                            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                                <div className="overflow-x-auto max-w-[100vw]"> {/* Scroll horizontal wrapper */}
                                    <table className="w-max text-xs text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase font-semibold border-b">
                                            <tr>
                                                <th rowSpan={2} className="px-3 py-2 border-r min-w-[100px] sticky left-0 z-10 bg-muted">Periodo</th>

                                                {/* PROGRAMACION */}
                                                <th colSpan={2} className="px-3 py-2 border-r text-center bg-gray-50">Programación (General)</th>
                                                <th colSpan={6} className="px-3 py-2 border-r text-center bg-gray-50">Detalle P. Gastos</th>

                                                {/* AVANCE */}
                                                <th colSpan={4} className="px-3 py-2 border-r text-center bg-blue-50 text-blue-800">Ejecución / Avance</th>
                                                <th colSpan={6} className="px-3 py-2 border-r text-center bg-blue-50 text-blue-800">Detalle A. Gastos</th>

                                                {/* POBLACION */}
                                                <th colSpan={2} className="px-3 py-2 text-center bg-green-50 text-green-800">Población</th>
                                            </tr>
                                            <tr>
                                                {/* Prog General */}
                                                <th className="px-3 py-2 border-r text-right min-w-[80px]">Cant.</th>
                                                <th className="px-3 py-2 border-r text-right min-w-[100px]">$$ Total</th>

                                                {/* Prog Detalle */}
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">Propio</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">Crédito</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">SGP</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">Regalías</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">Municipal</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px]">Otros</th>

                                                {/* Avance General */}
                                                <th className="px-3 py-2 border-r text-right min-w-[80px] bg-blue-50/50">Cant.</th>
                                                <th className="px-3 py-2 border-r text-right text-purple-700 bg-blue-50/50 font-bold">% Fis.</th>
                                                <th className="px-3 py-2 border-r text-right min-w-[100px] bg-blue-50/50">$$ Total</th>
                                                <th className="px-3 py-2 border-r text-right text-purple-700 bg-blue-50/50 font-bold">% Fin.</th>

                                                {/* Avance Detalle */}
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">Propio</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">Crédito</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">SGP</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">Regalías</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">Municipal</th>
                                                <th className="px-2 py-2 border-r text-right min-w-[90px] text-[10px] bg-blue-50/50">Otros</th>

                                                {/* Poblacion */}
                                                <th className="px-3 py-2 border-r min-w-[200px] bg-green-50/50">Enfoque Diferencial</th>
                                                <th className="px-3 py-2 min-w-[200px] bg-green-50/50">Grupos Edad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {data.detalles.map((d, i) => (
                                                <tr key={i} className="hover:bg-muted/30">
                                                    <td className="px-3 py-2 font-medium border-r sticky left-0 bg-background z-10">
                                                        {d.anio} - {d.trimestre}
                                                    </td>

                                                    {/* Programacion */}
                                                    <td className="px-3 py-2 text-right border-r ">{formatNumber(d.programacion_cantidad)}</td>
                                                    <td className="px-3 py-2 text-right border-r font-medium text-slate-700">{formatCurrency(d.programacion_gastos)}</td>

                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_pro)}</td>
                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_cre)}</td>
                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_sgp)}</td>
                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_reg)}</td>
                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_mun)}</td>
                                                    <td className="px-2 py-2 text-right border-r text-muted-foreground">{formatCurrency(d.prog_gasto_otr)}</td>

                                                    {/* Avance */}
                                                    <td className="px-3 py-2 text-right border-r bg-blue-50/20">{formatNumber(d.avance_cantidad)}</td>
                                                    <td className="px-3 py-2 text-right border-r font-bold text-purple-700 bg-blue-50/20">{d.porcentaje_cumplimiento_fisico}%</td>
                                                    <td className="px-3 py-2 text-right border-r font-medium text-blue-700 bg-blue-50/20">{formatCurrency(d.avance_gastos)}</td>
                                                    <td className="px-3 py-2 text-right border-r font-bold text-purple-700 bg-blue-50/20">{d.porcentaje_cumplimiento_financiero}%</td>

                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_pro)}</td>
                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_cre)}</td>
                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_sgp)}</td>
                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_reg)}</td>
                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_mun)}</td>
                                                    <td className="px-2 py-2 text-right border-r bg-blue-50/20 text-blue-900/80">{formatCurrency(d.av_gasto_otr)}</td>

                                                    {/* Poblacion */}
                                                    <td className="px-3 py-2 border-r bg-green-50/20 text-[10px]">
                                                        <div className="flex flex-wrap gap-1">
                                                            {d.cantesp_mujer > 0 && <Badge variant="outline" className="h-5 px-1">Mujer: {d.cantesp_mujer}</Badge>}
                                                            {d.cantesp_discapacidad > 0 && <Badge variant="outline" className="h-5 px-1">Discap: {d.cantesp_discapacidad}</Badge>}
                                                            {d.cantesp_etnia > 0 && <Badge variant="outline" className="h-5 px-1">Etnia: {d.cantesp_etnia}</Badge>}
                                                            {d.cantesp_victima > 0 && <Badge variant="outline" className="h-5 px-1">Víctima: {d.cantesp_victima}</Badge>}
                                                            {d.cantesp_lgtbi > 0 && <Badge variant="outline" className="h-5 px-1">LGTBI: {d.cantesp_lgtbi}</Badge>}
                                                            {d.cantesp_migrante > 0 && <Badge variant="outline" className="h-5 px-1">Migr: {d.cantesp_migrante}</Badge>}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 bg-green-50/20 text-[10px]">
                                                        <div className="flex flex-wrap gap-1">
                                                            {d.cantidad_0_5 > 0 && <span className="bg-white border rounded px-1">0-5: <b>{d.cantidad_0_5}</b></span>}
                                                            {d.cantidad_6_12 > 0 && <span className="bg-white border rounded px-1">6-12: <b>{d.cantidad_6_12}</b></span>}
                                                            {d.cantidad_13_17 > 0 && <span className="bg-white border rounded px-1">13-17: <b>{d.cantidad_13_17}</b></span>}
                                                            {d.cantidad_18_24 > 0 && <span className="bg-white border rounded px-1">18-24: <b>{d.cantidad_18_24}</b></span>}
                                                            {d.cantidad_25_62 > 0 && <span className="bg-white border rounded px-1">25-62: <b>{d.cantidad_25_62}</b></span>}
                                                            {d.cantidad_65_mas > 0 && <span className="bg-white border rounded px-1">65+: <b>{d.cantidad_65_mas}</b></span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full text-muted-foreground">
                            No se encontró información.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MetaSeguimiento;
