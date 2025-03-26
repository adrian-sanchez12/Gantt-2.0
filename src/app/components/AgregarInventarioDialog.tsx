"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { useState } from "react";

interface AgregarInventarioDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

export default function AgregarInventarioDialog({
  visible,
  onHide,
  onSave,
}: AgregarInventarioDialogProps) {
  const [formData, setFormData] = useState<any>({
    nombre_convenio: "",
    objeto_convenio: "",
    tipo_instrumento: "",
    presupuesto: "",
    instancias_tecnicas: "",
    informe: "",
    fecha_rige: null,
    fecha_vencimiento: null,
    cooperante: "",
    contraparte_externa: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatDate = (value: Date | null) =>
    value ? new Date(value).toISOString().split("T")[0] : null;

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        presupuesto: parseFloat(formData.presupuesto),
        fecha_rige: formatDate(formData.fecha_rige),
        fecha_vencimiento: formatDate(formData.fecha_vencimiento),
      };

      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al guardar el inventario");

      onSave();
      onHide();
      setFormData({}); // Limpia el formulario si se desea
    } catch (error) {
      console.error("Error al guardar nuevo inventario:", error);
    }
  };

  return (
    <Dialog
      header="Agregar Convenio"
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
      <div className="grid grid-cols-2 gap-6 text-sm mt-2">
        <div className="col-span-2">
          <label className="font-semibold">Nombre del Convenio</label>
          <InputText
            value={formData.nombre_convenio}
            onChange={(e) => handleChange("nombre_convenio", e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Objeto del Convenio</label>
          <InputTextarea
            value={formData.objeto_convenio}
            onChange={(e) => handleChange("objeto_convenio", e.target.value)}
            rows={3}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Tipo de Instrumento</label>
          <InputText
            value={formData.tipo_instrumento}
            onChange={(e) => handleChange("tipo_instrumento", e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Presupuesto</label>
          <InputText
            key="presupuesto"
            value={formData.presupuesto}
            onChange={(e) => handleChange("presupuesto", e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Instancias Técnicas</label>
          <InputTextarea
            value={formData.instancias_tecnicas}
            onChange={(e) => handleChange("instancias_tecnicas", e.target.value)}
            rows={2}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Informe</label>
          <InputTextarea
            value={formData.informe}
            onChange={(e) => handleChange("informe", e.target.value)}
            rows={2}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Fecha Rige</label>
          <Calendar
            value={formData.fecha_rige}
            onChange={(e) => handleChange("fecha_rige", e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Fecha Vencimiento</label>
          <Calendar
            value={formData.fecha_vencimiento}
            onChange={(e) => handleChange("fecha_vencimiento", e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Cooperante</label>
          <InputText
            value={formData.cooperante}
            onChange={(e) => handleChange("cooperante", e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>

        <div>
          <label className="font-semibold">Contraparte Externa</label>
          <InputText
            value={formData.contraparte_externa}
            onChange={(e) => handleChange("contraparte_externa", e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2 bg-white"
          />
        </div>
      </div>
    </Dialog>
  );
}
