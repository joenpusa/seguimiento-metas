import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api/axiosConfig";

const AdminMunicipios = () => {
  const { toast } = useToast();

  const [municipios, setMunicipios] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState(null);

  const [formData, setFormData] = useState({
    codigo_municipio: "",
    nombre: "",
    id_zona: "",
  });

  // ==============================
  // 🔹 Funciones API con axios
  // ==============================
  const fetchMunicipios = async () => {
    try {
      const res = await api.get("/municipios");
      setMunicipios(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudieron cargar los municipios.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const { codigo_municipio, nombre, id_zona } = formData;

    if (!codigo_municipio.trim() || !nombre.trim() || !id_zona.trim()) {
      toast({
        title: "Campos obligatorios",
        description: "Debe llenar todos los campos.",
        variant: "destructive",
      });
      return;
    }

    if (nombre.trim().toLowerCase() === "todo el departamento") {
      toast({
        title: "Error",
        description:
          'No puede añadir "Todo el departamento" manualmente.',
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMunicipio) {
        await api.put(`/municipios/${editingMunicipio.id_municipio}`, formData);
        toast({
          title: "Municipio actualizado",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        await api.post("/municipios", formData);
        toast({
          title: "Municipio creado",
          description: "Se añadió correctamente.",
        });
      }

      setOpenDialog(false);
      setEditingMunicipio(null);
      setFormData({ codigo_municipio: "", nombre: "", id_zona: "" });
      fetchMunicipios();
    } catch (err) {
      toast({
        title: "Error al guardar",
        description:
          err.response?.data?.message || "No se pudo guardar el municipio.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (muni) => {
    if (muni.nombre.toLowerCase() === "todo el departamento") {
      toast({
        title: "Acción no permitida",
        description: "'Todo el departamento' no se puede eliminar.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`¿Eliminar el municipio "${muni.nombre}"?`)) return;

    try {
      await api.delete(`/municipios/${muni.id_municipio}`);
      toast({
        title: "Municipio eliminado",
        description: `${muni.nombre} fue eliminado correctamente.`,
      });
      fetchMunicipios();
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description:
          err.response?.data?.message || "No se pudo eliminar el municipio.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (muni) => {
    if (muni.nombre.toLowerCase() === "todo el departamento") {
      toast({
        title: "Acción no permitida",
        description: "'Todo el departamento' no se puede editar.",
        variant: "destructive",
      });
      return;
    }

    setEditingMunicipio(muni);
    setFormData({
      codigo_municipio: muni.codigo_municipio,
      nombre: muni.nombre,
      id_zona: muni.id_zona,
    });
    setOpenDialog(true);
  };

  useEffect(() => {
    fetchMunicipios();
  }, []);

  // ==============================
  // 🔹 Render
  // ==============================
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Municipios</CardTitle>
          <Button
            size="sm"
            className="gap-1 absolute top-4 right-4"
            onClick={() => {
              setEditingMunicipio(null);
              setFormData({ codigo_municipio: "", nombre: "", id_zona: "" });
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
                  key={muni.id_municipio}
                  className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm text-sm"
                >
                  <div>
                    <span className="font-medium">{muni.nombre}</span>
                    <span className="text-gray-500 ml-2 text-xs">
                      ({muni.codigo_municipio} - {muni.id_zona})
                    </span>
                  </div>

                  {muni.nombre.toLowerCase() !== "todo el departamento" && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-600"
                        onClick={() => handleEdit(muni)}
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
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

      {/* =======================
          🔹 Modal de Registro/Edición
      ======================= */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingMunicipio ? "Editar Municipio" : "Añadir Municipio"}
            </DialogTitle>
            <DialogDescription>
              {editingMunicipio
                ? "Modifique los datos del municipio seleccionado."
                : "Ingrese los datos del nuevo municipio."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="codigo_municipio">Código del Municipio</Label>
              <Input
                id="codigo_municipio"
                value={formData.codigo_municipio}
                onChange={(e) =>
                  setFormData({ ...formData, codigo_municipio: e.target.value })
                }
                placeholder="Ej: 101"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Municipio</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: Nuevo Paraíso"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="id_zona">Zona</Label>
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
              onClick={() => {
                setOpenDialog(false);
                setEditingMunicipio(null);
                setFormData({ codigo_municipio: "", nombre: "", id_zona: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />{" "}
              {editingMunicipio ? "Guardar Cambios" : "Añadir Municipio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminMunicipios;
