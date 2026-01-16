import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

import { useMeta } from "@/context/MetaContext";
import { usePlan } from "@/context/PlanContext";
import { useUnidad } from "@/context/UnidadContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";

const SOURCES = [
    { key: "pro", label: "Propios" },
    { key: "sgp", label: "SGP" },
    { key: "reg", label: "Regalías" },
    { key: "cre", label: "Crédito" },
    { key: "mun", label: "Municipio O Nación" },
    { key: "otr", label: "Otros" },
];

const TabsYearSelectorReadOnly = ({ meta }) => {
    const [year, setYear] = useState(1);

    if (!meta) return null;

    // Calculate total for current year tab
    const currentYearTotal = SOURCES.reduce(
        (acc, src) => acc + (Number(meta[`val${year}_${src.key}`]) || 0),
        0
    );

    const grandTotal = [1, 2, 3, 4].reduce((total, y) => {
        return total + SOURCES.reduce((acc, src) => acc + (Number(meta[`val${y}_${src.key}`]) || 0), 0);
    }, 0);

    return (
        <div className="flex flex-col gap-4">
            {/* Tabs Header */}
            <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                {[1, 2, 3, 4].map((y) => (
                    <div
                        key={y}
                        role="button"
                        onClick={() => setYear(y)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors cursor-pointer select-none
              ${year === y
                                ? "bg-white dark:bg-slate-800 border-b-2 border-primary text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                            }
            `}
                    >
                        Año {y}
                    </div>
                ))}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 animate-in fade-in zoom-in-95 duration-200">
                {SOURCES.map((src) => (
                    <div key={src.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{src.label}</Label>
                        <div className="relative">
                            <div className="flex items-center text-sm font-medium border rounded-md px-3 py-1.5 bg-slate-50 text-slate-700">
                                <span className="text-muted-foreground mr-1">$</span>
                                {(meta[`val${year}_${src.key}`] || 0).toLocaleString("es-CO")}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Year Summary */}
            <div className="flex justify-between items-center border-t pt-3 mt-2 border-dashed">
                <div className="text-xs text-muted-foreground">
                    Total Año {year}: <span className="font-semibold text-foreground">${currentYearTotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="text-sm font-bold">
                    Gran Total: ${grandTotal.toLocaleString("es-CO")}
                </div>
            </div>
        </div>
    );
};

const MetaForm = ({ open, onOpenChange, onSave, metaToEdit = null }) => {
    const { toast } = useToast();
    const { selectedMeta } = useMeta();
    // 🔹 Contextos correctos
    const { activePlanId } = usePlan();
    const { municipios } = useMunicipio();

    const initialFormState = {
        id: "",
        planId: activePlanId || "",
        lineaEstrategica: "",
        componente: "",
        apuesta: "",
        iniciativa: "",
        nombre: "",
        descripcion: "",
        cantidad: 0,
        unidadMedida: "",
        responsable: "",
        fechaLimite: "",
        progreso: 0,
        municipios: [],
        avances: [],
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (selectedMeta) {
            setFormData({
                ...initialFormState,
                ...selectedMeta,
                planId: activePlanId,
            });
        } else {
            setFormData({ ...initialFormState, planId: activePlanId });
        }
    }, [selectedMeta, open, activePlanId]);

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) {
                    setFormData({ ...initialFormState, planId: activePlanId });
                }
            }}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Detalles de la Meta (Modo Lectura)
                    </DialogTitle>
                    <DialogDescription>
                        Este formulario es solo para visualización. La gestión de metas se
                        realiza en &quot;Administración General&quot;.
                    </DialogDescription>
                </DialogHeader>

                <form>
                    {/* 🔒 SOLO LECTURA */}
                    <fieldset disabled>
                        <div className="grid gap-6 py-4">

                            {/* 🌳 ESTRUCTURA JERÁRQUICA */}
                            <div className="space-y-4">

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Línea estratégica
                                    </Label>
                                    <p className="font-medium">
                                        {selectedMeta?.linea
                                            ? `${selectedMeta.linea.codigo} - ${selectedMeta.linea.nombre}`
                                            : "—"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Componente
                                    </Label>
                                    <p className="font-medium">
                                        {selectedMeta?.componente
                                            ? `${selectedMeta.componente.codigo} - ${selectedMeta.componente.nombre}`
                                            : "—"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Apuesta
                                    </Label>
                                    <p className="font-medium">
                                        {selectedMeta?.apuesta
                                            ? `${selectedMeta.apuesta.codigo} - ${selectedMeta.apuesta.nombre}`
                                            : "—"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Iniciativa
                                    </Label>
                                    <p className="font-medium">
                                        {selectedMeta?.iniciativa
                                            ? `${selectedMeta.iniciativa.codigo} - ${selectedMeta.iniciativa.nombre}`
                                            : "—"}
                                    </p>
                                </div>

                            </div>

                            <hr />

                            {/* 🎯 META */}
                            <div className="space-y-4">

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Meta
                                    </Label>
                                    <p className="font-semibold text-lg">
                                        {selectedMeta?.nombre || "—"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Descripción
                                    </Label>
                                    <p className="text-sm leading-relaxed">
                                        {selectedMeta?.descripcion || "—"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">

                                    <Label className="text-xs text-muted-foreground">
                                        Cantidad (Cuatrienio: {selectedMeta?.cantidad ?? 0})
                                    </Label>
                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Año 1</span>
                                            <span className="text-sm font-medium">{selectedMeta?.cant_ano1 || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Año 2</span>
                                            <span className="text-sm font-medium">{selectedMeta?.cant_ano2 || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Año 3</span>
                                            <span className="text-sm font-medium">{selectedMeta?.cant_ano3 || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">Año 4</span>
                                            <span className="text-sm font-medium">{selectedMeta?.cant_ano4 || 0}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Unidad de medida
                                        </Label>
                                        <p className="font-medium">
                                            {selectedMeta?.unidad?.nombre || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Fecha límite
                                    </Label>
                                    <p className="font-medium">
                                        {selectedMeta?.fechaLimite
                                            ? new Date(selectedMeta.fechaLimite).toLocaleDateString("es-CO")
                                            : "—"}
                                    </p>
                                </div>

                                {/* 💰 PRESUPUESTO */}
                                <div className="space-y-3 mt-4 border rounded-md p-4 bg-slate-50/50">
                                    <Label className="text-base font-semibold">
                                        Recursos Financieros (Valor en millones)
                                    </Label>
                                    <TabsYearSelectorReadOnly meta={selectedMeta} />
                                </div>

                                {/* MUNICIPIOS */}
                                <div className="space-y-2 mt-4">
                                    <Label>Municipios</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                                        {municipios.map((m) => (
                                            <label key={m.id} className="flex items-center gap-2 text-xs">
                                                <Checkbox
                                                    checked={formData.municipios.includes(m.id)}
                                                    onCheckedChange={(checked) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            municipios: checked
                                                                ? [...prev.municipios, m.id]
                                                                : prev.municipios.filter((id) => id !== m.id),
                                                        }))
                                                    }
                                                />
                                                {m.nombre}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            </div>

                        </div>
                    </fieldset>

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setFormData({ ...initialFormState, planId: activePlanId });
                            }}
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MetaForm;