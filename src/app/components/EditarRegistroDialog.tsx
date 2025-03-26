"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const fases = [
  { label: "Negociación", value: "Negociación" },
  { label: "Visto Bueno", value: "Visto Bueno" },
  { label: "Revisión Técnica", value: "Revisión Técnica" },
  { label: "Análisis Legal", value: "Análisis Legal" },
  { label: "Verificación Legal", value: "Verificación Legal" },
  { label: "Firma", value: "Firma" },
];

interface EditarRegistroDialogProps {
    visible: boolean;
    onHide: () => void;
    registro: any; 
    onSave: (data: any) => void;
  }

  export default function EditarRegistroDialog({
    visible,
    onHide,
    registro,
    onSave,
  }: EditarRegistroDialogProps) {
    const toast = useRef<Toast | null>(null);
    const [formData, setFormData] = useState(registro || {});
  
    useEffect(() => {
      if (registro) {
        setFormData(registro);
      }
    }, [registro]);

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name:any, value:any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name:any, value:any) => {
    setFormData({ ...formData, [name]: value });
  };

  // Convierte la fecha a formato MariaDB (YYYY-MM-DD HH:MM:SS)
  const formatDateForMariaDB = (date:any) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    try {  
      const response = await fetch(`/api/registro_procesos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fecha_inicio: formData.fecha_inicio ? formatDateForMariaDB(formData.fecha_inicio) : null,
          fecha_final: formData.fecha_final ? formatDateForMariaDB(formData.fecha_final) : null,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
  
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro actualizado correctamente.",
        life: 2000,
      });
  
      onSave(formData);
      onHide();
    } catch (error) {
      console.error(" Error al actualizar el registro:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Error al guardar: ${(error as any).message}`,
        life: 3000,
      });
    }
  };
  
  return (
    <Dialog
      header="Editar Registro"
      visible={visible}
      onHide={onHide}
      style={{ width: "50vw" }}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={onHide} />
          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={handleSubmit}
            className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          />
        </div>
      }
    >
      <Toast ref={toast} />
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Entidad Proponente</label>
          <InputText name="entidad_proponente" value={formData.entidad_proponente || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Autoridad Ministerial</label>
          <InputText name="autoridad_ministerial" value={formData.autoridad_ministerial || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Funcionario Emisor</label>
          <InputText name="funcionario_emisor" value={formData.funcionario_emisor || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Entidad Emisora</label>
          <InputText name="entidad_emisora" value={formData.entidad_emisora || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Funcionario Receptor</label>
          <InputText name="funcionario_receptor" value={formData.funcionario_receptor || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Entidad Receptora</label>
          <InputText name="entidad_receptora" value={formData.entidad_receptora || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col col-span-2">
          <label className="font-semibold text-gray-600 mb-1">Registro del Proceso</label>
          <textarea name="registro_proceso" value={formData.registro_proceso || ""} onChange={handleChange} className="p-inputtext-sm w-full border border-gray-300 rounded-lg p-2 bg-white resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Fecha Inicio</label>
          <Calendar name="fecha_inicio" value={formData.fecha_inicio || null} onChange={(e) => handleDateChange("fecha_inicio", e.value)} className="p-inputtext-sm border border-gray-300 rounded-lg p-2" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Tipo de Convenio</label>
          <InputText name="tipo_convenio" value={formData.tipo_convenio || ""} onChange={handleChange} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-1">Fase del Registro</label>
          <Dropdown name="fase_registro" value={formData.fase_registro} options={fases} onChange={(e) => handleDropdownChange("fase_registro", e.value)} className="p-inputtext-sm p-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </Dialog>
  );
}
