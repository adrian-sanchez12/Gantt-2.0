"use client";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { supabase } from "@/lib/supabase";

const sectores = [
  { label: "Salud", value: "Salud" },
  { label: "Educación", value: "Educación" },
  { label: "Infraestructura", value: "Infraestructura" },
];

const tiposConvenio = [
  { label: "Bilateral", value: "Bilateral" },
  { label: "Multilateral", value: "Multilateral" },
  { label: "Cooperación", value: "Cooperación" },
];

export default function IngresarConvenioForm() {
  const [formData, setFormData] = useState<any>({
    cooperante: "",
    sector: "",
    autoridad_ministerial: "",
    funcionario_emisor1: "",
    entidad_emisora: "",
    funcionario_receptor: "",
    entidad_receptora: "",
    registro_proceso: "",
    fecha_inicio: null,
    fecha_final: null,
    tipo_convenio: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("convenios").insert([formData]);
    if (error) {
      console.error("Error al ingresar convenio", error);
    } else {
      alert("Convenio ingresado con éxito");
      setFormData({
        cooperante: "",
        sector: "",
        autoridad_ministerial: "",
        funcionario_emisor1: "",
        entidad_emisora: "",
        funcionario_receptor: "",
        entidad_receptora: "",
        registro_proceso: "",
        fecha_inicio: null,
        fecha_final: null,
        tipo_convenio: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto space-y-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-700">Ingresar Convenio</h2>
      <div className="grid grid-cols-2 gap-6">
        <InputText name="cooperante" value={formData.cooperante} onChange={handleChange} placeholder="Cooperante" className="w-full p-2 border rounded-lg" />
        <Dropdown name="sector" value={formData.sector} options={sectores} onChange={(e) => handleDropdownChange("sector", e.value)} placeholder="Sector" className="w-full p-2 border rounded-lg" />
        <InputText name="autoridad_ministerial" value={formData.autoridad_ministerial} onChange={handleChange} placeholder="Autoridad Ministerial" className="w-full p-2 border rounded-lg" />
        <InputText name="funcionario_emisor1" value={formData.funcionario_emisor1} onChange={handleChange} placeholder="Funcionario Emisor" className="w-full p-2 border rounded-lg" />
        <InputText name="entidad_emisora" value={formData.entidad_emisora} onChange={handleChange} placeholder="Entidad Emisora" className="w-full p-2 border rounded-lg" />
        <InputText name="funcionario_receptor" value={formData.funcionario_receptor} onChange={handleChange} placeholder="Funcionario Receptor" className="w-full p-2 border rounded-lg" />
        <InputText name="entidad_receptora" value={formData.entidad_receptora} onChange={handleChange} placeholder="Entidad Receptora" className="w-full p-2 border rounded-lg" />
      </div>
      <InputTextarea name="registro_proceso" value={formData.registro_proceso} onChange={handleChange} placeholder="Registro del Proceso" className="w-full p-2 border rounded-lg h-24" />
      <div className="grid grid-cols-2 gap-6">
        <Calendar name="fecha_inicio" value={formData.fecha_inicio} onChange={(e) => handleDateChange("fecha_inicio", e.value)} placeholder="Fecha Inicio" className="w-full p-2 border rounded-lg" />
        <Calendar name="fecha_final" value={formData.fecha_final} onChange={(e) => handleDateChange("fecha_final", e.value)} placeholder="Fecha Final" className="w-full p-2 border rounded-lg" />
      </div>
      <Dropdown name="tipo_convenio" value={formData.tipo_convenio} options={tiposConvenio} onChange={(e) => handleDropdownChange("tipo_convenio", e.value)} placeholder="Tipo de Convenio" className="w-full p-2 border rounded-lg" />
      <div className="flex justify-between mt-4">
        <Button type="button" label="Cancelar" className="p-button-secondary" />
        <Button type="submit" label="Guardar Convenio" className="p-button-primary" />
      </div>
    </form>
  );
}
