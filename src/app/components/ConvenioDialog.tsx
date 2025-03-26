"use client";

import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

interface ConvenioDialogProps {
  visible: boolean;  
  onHide: () => void; 
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

export default function ConvenioDialog({ visible, onHide, onRefresh }: ConvenioDialogProps) {
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState({
    cooperante: "",
    nombre: "",
    sector: "",
    otroSector: "",
    consecutivo_numerico: "",
    fase_actual: "Negociación",
    firmado: false,
  });

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name:any, value:any) => {
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

    let consecutivo = formData.consecutivo_numerico?.trim() || null;

    try {
      if (!consecutivo) {
        const response = await fetch("/api/convenios/max-consecutivo");
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        consecutivo = data.maxConsecutivo ? data.maxConsecutivo + 1 : 1;
      }

      // Validar si el consecutivo ya existe
      const checkResponse = await fetch(`/api/convenios/check-consecutivo?consecutivo=${consecutivo}`);
      const checkData = await checkResponse.json();
      if (checkData.exists) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "El número ya existe, ingrese otro.",
          life: 3000,
        });
        return;
      }

      // Insertar convenio
      const insertResponse = await fetch("/api/convenios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cooperante: formData.cooperante,
          nombre: formData.nombre,
          sector: formData.sector === "Otro" ? formData.otroSector : formData.sector,
          fase_actual: formData.fase_actual,
          firmado: false,
          consecutivo_numerico: consecutivo,
        }),
      });

      if (!insertResponse.ok) throw new Error("Error al guardar el convenio");

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Convenio registrado correctamente.",
        life: 2000,
      });

      onRefresh();
      onHide();

      setFormData({
        cooperante: "",
        nombre: "",
        sector: "",
        otroSector: "",
        consecutivo_numerico: "",
        fase_actual: "Negociación",
        firmado: false,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Error al guardar: ${(error as any).message}`,
    life: 3000,
      });
    }
  };

  return (
<Dialog header="Ingresar Convenio" visible={visible} onHide={onHide} style={{ width: "50vw" }}>
        <Toast ref={toast} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
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

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Consecutivo Numérico (Opcional)</label>
            <InputText 
              name="consecutivo_numerico" 
              value={formData.consecutivo_numerico} 
              onChange={handleChange} 
              placeholder="Si no se ingresa, se generará automático"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-secondary" onClick={onHide} />
          <Button label="Guardar Convenio" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
}
