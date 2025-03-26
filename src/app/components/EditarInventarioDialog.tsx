"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";

interface EditarInventarioDialogProps {
  visible: boolean;
  onHide: () => void;
  registro: any;
  onSave: () => void;
}

export default function EditarInventarioDialog({
  visible,
  onHide,
  registro,
  onSave,
}: EditarInventarioDialogProps) {
  const [formData, setFormData] = useState<any>(registro);

  useEffect(() => {
    setFormData(registro);
  }, [registro]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const formatDate = (value: string | Date | null) => {
        if (!value) return null;
        return new Date(value).toISOString().split("T")[0];
      };

      const payload = {
        ...formData,
        presupuesto: parseFloat(formData.presupuesto),
        fecha_rige: formatDate(formData.fecha_rige),
        fecha_vencimiento: formatDate(formData.fecha_vencimiento),
      };

      const response = await fetch("/api/inventario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar el inventario");

      onSave();
      onHide();
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  return (
    <Dialog
      header="Editar Inventario"
      visible={visible}
      style={{ width: "50vw", maxWidth: "700px" }}
      modal
      onHide={onHide}
      className="p-dialog-custom"
      footer={
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-outlined p-button-secondary"
            onClick={onHide}
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
            onClick={handleSubmit}
          />
        </div>
      }
    >
      {formData && (
        <div className="grid grid-cols-2 gap-6 text-sm mt-2">
          <div className="col-span-2">
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Nombre del Convenio</label>
            <InputText
              value={formData.nombre_convenio || ""}
              onChange={(e) => handleChange("nombre_convenio", e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Objeto del Convenio</label>
            <InputTextarea
              value={formData.objeto_convenio || ""}
              onChange={(e) => handleChange("objeto_convenio", e.target.value)}
              rows={4}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Tipo de Instrumento</label>
            <InputText
              value={formData.tipo_instrumento || ""}
              onChange={(e) => handleChange("tipo_instrumento", e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Presupuesto</label>
            <InputText
              value={formData.presupuesto || ""}
              onChange={(e) => handleChange("presupuesto", e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Fecha Rige</label>
            <Calendar
              value={formData.fecha_rige ? new Date(formData.fecha_rige) : undefined}
              onChange={(e) => handleChange("fecha_rige", e.value)}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Fecha Vencimiento</label>
            <Calendar
              value={formData.fecha_vencimiento ? new Date(formData.fecha_vencimiento) : undefined}
              onChange={(e) => handleChange("fecha_vencimiento", e.value)}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Instancias Técnicas</label>
            <InputTextarea
              value={formData.instancias_tecnicas || ""}
              onChange={(e) => handleChange("instancias_tecnicas", e.target.value)}
              rows={3}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-semibold mb-1 uppercase">Informe</label>
            <InputTextarea
              value={formData.informe || ""}
              onChange={(e) => handleChange("informe", e.target.value)}
              rows={3}
              className="w-full border border-gray-400 rounded-md p-2 shadow-sm bg-white"
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
