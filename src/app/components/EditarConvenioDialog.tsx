"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

interface EditarConvenioDialogProps {
  visible: boolean;
  onHide: () => void;
  convenio: any; // Usa la interfaz Convenio si la tienes
  onRefresh: () => void;
}

const sectores = [
  { label: "Bilateral", value: "Bilateral" },
  { label: "Sociedad Civil", value: "Sociedad Civil" },
  { label: "Privado", value: "Privado" },
  { label: "Público", value: "Público" },
  { label: "Academia", value: "Academia" },
  { label: "Multilateral Regional", value: "Multilateral Regional" },
  { label: "Multilateral Naciones Unidas", value: "Multilateral Naciones Unidas" },
  { label: "Otro (Escribir manualmente)", value: "Otro" },
];

export default function EditarConvenioDialog({ visible, onHide, convenio, onRefresh }: EditarConvenioDialogProps) {
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState({
    id: 0,
    cooperante: "",
    nombre: "",
    sector: "",
    otroSector: "",
    consecutivo_numerico: "",
    fase_actual: "",
    firmado: false,
  });

  // ✅ Cargar datos del convenio seleccionado
  useEffect(() => {
    if (convenio) {
      setFormData({
        id: convenio.id,
        cooperante: convenio.cooperante || "",
        nombre: convenio.nombre || "",
        sector: sectores.some((s) => s.value === convenio.sector) ? convenio.sector : "Otro",
        otroSector: sectores.some((s) => s.value === convenio.sector) ? "" : convenio.sector || "",
        consecutivo_numerico: convenio.consecutivo_numerico || "",
        fase_actual: convenio.fase_actual || "Negociación",
        firmado: convenio.firmado || false,
      });
    }
  }, [convenio]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value, otroSector: value === "Otro" ? "" : "" });
  };

  const handleSubmit = async () => {
    if (!formData.cooperante || !formData.nombre || (!formData.sector && !formData.otroSector)) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos Requeridos",
        detail: "Completa todos los campos.",
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`/api/convenios?id=${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          cooperante: formData.cooperante,
          nombre: formData.nombre,
          sector: formData.sector === "Otro" ? formData.otroSector : formData.sector,
          fase_actual: formData.fase_actual,
          firmado: formData.firmado,
          consecutivo_numerico: formData.consecutivo_numerico,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar el convenio");

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Convenio actualizado correctamente.",
        life: 2000,
      });

      onRefresh();
      onHide();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Error al actualizar: ${(error as any).message}`,
        life: 3000,
      });
    }
  };

  return (
    <Dialog header="Editar Convenio" visible={visible} onHide={onHide} style={{ width: "50vw" }}>
      <Toast ref={toast} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Cooperante */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700">Cooperante \ Adenda</label>
            <InputText
              name="cooperante"
              value={formData.cooperante}
              onChange={handleChange}
              placeholder="Ingrese el cooperante"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col col-span-2">
            <label className="font-semibold text-gray-700">Nombre del Convenio</label>
            <textarea
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre del convenio"
              className="w-full p-2 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Sector */}
          <div className="flex flex-col col-span-2">
            <label className="font-semibold text-gray-700">Sector</label>
            <Dropdown
              name="sector"
              value={formData.sector}
              options={sectores}
              onChange={(e) => handleDropdownChange("sector", e.value)}
              placeholder="Seleccione un sector"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {formData.sector === "Otro" && (
              <InputText
                name="otroSector"
                value={formData.otroSector}
                onChange={handleChange}
                placeholder="Ingrese el sector"
                className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>

          {/* Consecutivo Numérico (solo lectura) */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Consecutivo Numérico (Solo lectura)</label>
            <InputText
              name="consecutivo_numerico"
              value={formData.consecutivo_numerico}
              disabled
              placeholder="No editable"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <small className="text-gray-500 text-sm mt-1">
              Este número se mantiene igual para preservar la integridad del registro.
            </small>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-outlined p-button-secondary"
            onClick={onHide}
          />
          <Button
            label="Actualizar Convenio"
            icon="pi pi-check"
            className="p-button-primary"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}

