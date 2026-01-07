import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Edit3 } from "lucide-react";
import { useMunicipio } from "@/context/MunicipioContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const AdminMunicipios = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState(null);

  const [formData, setFormData] = useState({
    codigo_municipio: "",
    nombre: "",
    id_zona: "",
  });

  const {
    municipios,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio,
    fetchMunicipios,
  } = useMunicipio();

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  /* ============================
     EDITAR MUNICIPIO
  ============================ */
  const handleEdit = (muni) => {
    setEditingMunicipio(muni);
    setFormData({
      codigo_municipio: muni.codigo,
      nombre: muni.nombre,
      id_zona: muni.id_zona,
    });
    setOpenDialog(true);
  };

  /* ============================
     GUARDAR
  ============================ */
  const handleSave = async () => {
    if (editingMunicipio) {
      await updateMunicipio(editingMunicipio.id, formData);
    } else {
      await createMunicipio(formData);
    }

    setOpenDialog(false);
    setEditingMunicipio(null);
    setFormData({ codigo_municipio: "", nombre: "", id_zona: "" });
  };

  /* ============================
     ELIMINAR
  ============================ */
  const handleDelete = async (muni) => {
    if (!confirm(`¿Eliminar "${muni.nombre}"?`)) return;
    await deleteMunicipio(muni);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Municipios</CardTitle>
          <Button
            size="sm"
            className="gap-1 absolute top-4 right-4"
            onClick={() => {
              setEditingMunicipio(null);
              setFormData({
                codigo_municipio: "",
                nombre: "",
                id_zona: "",
              });
              setOpenDialog(true);
            }}
          >
            <Plus size={16} /> Añadir Municipio
          </Button>
        </CardHeader>

        <CardContent className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-b-md">
          {municipios.length > 0 ? (
            <ul className="space-y-2">
              {municipios.map((muni) => (
                <li
                  key={muni.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm text-sm"
                >
                  <div>
                    <span className="font-medium">{muni.nombre}</span>
                    <span className="text-gray-500 ml-2 text-xs">
                      ({muni.codigo} - {muni.id_zona})
                    </span>
                  </div>

                  {muni.nombre.toLowerCase() !== "todo el departamento" && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500"
                        onClick={() => handleEdit(muni)}
                      >
                        <Edit3 size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => handleDelete(muni)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay municipios definidos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ============================
         MODAL
      ============================ */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingMunicipio ? "Editar Municipio" : "Añadir Municipio"}
            </DialogTitle>
            <DialogDescription>
              {editingMunicipio
                ? "Modifique los datos del municipio."
                : "Ingrese los datos del nuevo municipio."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Código</Label>
              <Input
                value={formData.codigo_municipio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigo_municipio: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Zona</Label>
              <Select
                value={formData.id_zona}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_zona: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Norte">Norte</SelectItem>
                  <SelectItem value="Sur">Sur</SelectItem>
                  <SelectItem value="Oriente">Oriente</SelectItem>
                  <SelectItem value="Occidente">Occidente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              {editingMunicipio ? "Guardar Cambios" : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminMunicipios;
