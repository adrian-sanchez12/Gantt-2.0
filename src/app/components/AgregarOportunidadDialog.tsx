"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { useState } from "react";
import { API_BASE } from "@/utils/api";

interface AgregarOportunidadDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

const modalidades = [
  { label: "Presencial", value: "Presencial" },
  { label: "Virtual", value: "Virtual" },
  { label: "Híbrido", value: "Híbrido" },
];

const tiposOportunidad = [
  { label: "Seminario", value: "Seminario" },
  { label: "Webinario", value: "Webinario" },
  { label: "Curso", value: "Curso" },
  { label: "Beca", value: "Beca" },
  { label: "Capacitación", value: "Capacitación" },
  { label: "Charla", value: "Charla" },
  { label: "Otro (escribir)", value: "Otro" },
];

const sectores = [
  { label: "Bilateral", value: "Bilateral" },
  { label: "Multilateral", value: "Multilateral" },
  { label: "Academia", value: " Academia" },
  { label: "Público", value: "Público" },
  { label: "Privado", value: "Privado" },
];

const temas = [
  { label: "Educación alimentaria y nutricional", value: "Educación alimentaria y nutricional" },
  { label: "Bienestar estudiantil", value: "Bienestar estudiantil" },
  { label: "Educación inclusiva", value: " Educación inclusiva" },
  { label: "Educación para el Desarrollo Sostenible", value: "Educación para el Desarrollo Sostenible" },
  { label: "Educación técnica Profesional", value: "Educación técnica Profesional" },
  { label: "Emprendimiento", value: "Emprendimiento" },
  { label: "Formación permanente", value: "Formación permanente" },
  { label: "Infraestructura Educativa", value: "Infraestructura Educativa" },
  { label: "Innovación y fortalecimiento en los aprendizajes", value: "Innovación y fortalecimiento en los aprendizajes" },
  { label: "Transformación digital", value: "Transformación digital" },
  { label: "Evaluación Educativa", value: "Evaluación Educativa" },
  { label: "Multilinguismo", value: "Multilinguismo" },
  { label: "Alianzas estratégicas", value: "Alianzas estratégicas" },
  { label: "Gestión de riesgos", value: "Gestión de riesgos" },
  { label: "Otro (escribir)", value: "Otro" },
];

const despachos = [
  { label: "Ministro", value: "Ministro" },
  { label: "Académico", value: "Académico" },
  { label: "Administrativo", value: "Administrativo" },
  { label: "Planificación Institucional y Coordinación Regional", value: "Planificación y Coordinación Regional" },
  { label: "Interdisciplinario (escribir)", value: "Interdisciplinario" },
];

const poblaciones = [
  { label: "Estudiantes", value: "Estudiantes" },
  { label: "Docentes", value: "Docentes" },
  { label: "Asesores", value: "Asesores" },
  { label: "Comunidad estudiantil", value: "Comunidad estudiantil" },
  { label: "Autoridades MEP", value: "Autoridades MEP" },
  { label: "Directores MEP", value: "Directores MEP" },
  { label: "Otro (escribir)", value: "Otro" },
];

//Los que dicen otros se necesitan para los dropdowns que contienen "Otro" como opción
export default function AgregarOportunidadDialog({ visible, onHide, onSave }: AgregarOportunidadDialogProps) {
  const [formData, setFormData] = useState({
    nombre_oportunidad: "",
    objetivo: "",
    modalidad: "",
    tipo_oportunidad: "",
    otroTipo: "",
    socio: "",
    sector: "",
    tema: "",
    otroTema: "",
    poblacion_meta: [] as string[],
    otraPoblacion: "",
    despacho: "",
    otroDespacho: "",
    direccion_envio: "",
    fecha_inicio: null,
    fecha_fin: null,
    funcionario: "",
    observaciones: "",
  });

  //Mensaje de error de información faltante
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [camposConError, setCamposConError] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatDate = (value: Date | null) =>
    value ? new Date(value).toISOString().split("T")[0] : null;

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        //Permite que lo que el usuario escriba en otro se agregue directamente a la db
        tipo_oportunidad:
          formData.tipo_oportunidad === "Otro" ? formData.otroTipo : formData.tipo_oportunidad,
        tema:
          formData.tema === "Otro" ? formData.otroTema : formData.tema,
        despacho:
          formData.despacho === "Interdisciplinario" ? formData.otroDespacho : formData.despacho,
        poblacion_meta:
          formData.poblacion_meta.includes("Otro")
            ? [...formData.poblacion_meta.filter(p => p !== "Otro"), formData.otraPoblacion].join(", ")
            : formData.poblacion_meta.join(", "),
        fecha_inicio: formatDate(formData.fecha_inicio),
        fecha_fin: formatDate(formData.fecha_fin),
      };

      //Error de campo faltante
      const camposFaltantes: string[] = [];
      if (!formData.nombre_oportunidad) camposFaltantes.push("nombre_oportunidad");
      if (!formData.objetivo) camposFaltantes.push("objetivo");
      if (!formData.fecha_inicio) camposFaltantes.push("fecha_inicio");
      if (!formData.socio) camposFaltantes.push("socio");

      if (camposFaltantes.length > 0) {
        setCamposConError(camposFaltantes);
        setErrorMensaje("Por favor complete todos los campos obligatorios.");
        return;
      }

      setCamposConError([]);
      setErrorMensaje(null);

      const response = await fetch(`${API_BASE}oportunidades/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMensaje(errorData.error || "Error al guardar la oportunidad");
        return;
      }
      else {
        setErrorMensaje(null);
      }

      onSave();
      onHide();
      setFormData({
        nombre_oportunidad: "",
        objetivo: "",
        modalidad: "",
        tipo_oportunidad: "",
        otroTipo: "",
        socio: "",
        sector: "",
        tema: "",
        otroTema: "",
        poblacion_meta: [] as string[],
        otraPoblacion: "",
        despacho: "",
        otroDespacho: "",
        direccion_envio: "",
        fecha_inicio: null,
        fecha_fin: null,
        funcionario: "",
        observaciones: "",
      });
    } catch (error) {
      console.error("Error al guardar la nueva oportunidad:", error);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre_oportunidad: "",
      objetivo: "",
      modalidad: "",
      tipo_oportunidad: "",
      otroTipo: "",
      socio: "",
      sector: "",
      tema: "",
      otroTema: "",
      poblacion_meta: [] as string[],
      otraPoblacion: "",
      despacho: "",
      otroDespacho: "",
      direccion_envio: "",
      fecha_inicio: null,
      fecha_fin: null,
      funcionario: "",
      observaciones: "",
    });
    setCamposConError([]);
    setErrorMensaje(null);
  };

  return (
    <Dialog
      header="Agregar oportunidad profesional"
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
            onClick={() => {
              limpiarFormulario();
              onHide();
            }}
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
      {errorMensaje && (
        <div className="col-span-2 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {errorMensaje}
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 text-sm mt-2">
        <div className="col-span-2">
          <label className="font-semibold">Nombre de la oportunidad</label>
          <InputText
            value={formData.nombre_oportunidad}
            onChange={(e) => handleChange("nombre_oportunidad", e.target.value)}
            //Ayuda visual con el control de errores de falta de información
            className={`w-full border rounded-lg p-5 bg-white ${camposConError.includes("nombre_oportunidad")
              ? "border-red-500"
              : "border-gray-300"
              }`}
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Objetivo</label>
          <InputText
            value={formData.objetivo}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            className={`w-full border rounded-lg p-5 bg-white ${camposConError.includes("objetivo")
              ? "border-red-500"
              : "border-gray-300"
              }`}
          />
        </div>

        <div>
          <label className="font-semibold">Modalidad</label>
          <Dropdown
            value={formData.modalidad}
            options={modalidades}
            onChange={(e) => setFormData({ ...formData, modalidad: e.value })}
            placeholder="Seleccione la modalidad"
            className="w-full text-sm border border-gray-300 rounded-md"
            panelClassName="text-sm"
            style={{ height: "45px", padding: "0 0.25rem", fontSize: "0.875rem" }}
          />
        </div>

        <div>
          <label className="font-semibold">Tipo</label>
          <Dropdown
            value={formData.tipo_oportunidad}
            options={tiposOportunidad}
            onChange={(e) => setFormData({ ...formData, tipo_oportunidad: e.value, otroTipo: e.value === "Otro" ? "" : "" })}
            placeholder="Seleccione el tipo"
            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
          />
          {formData.tipo_oportunidad === "Otro" && (
            <InputText
              value={formData.otroTipo ?? ""}
              onChange={(e) => setFormData({ ...formData, otroTipo: e.target.value })}
              placeholder="Escriba el tipo"
              className="w-full mt-2 bg-gray-100 text-sm border-none rounded-none"
            />
          )}
        </div>

        <div>
          <label className="font-semibold">Socio estratégico</label>
          <InputText
            value={formData.socio}
            onChange={(e) => handleChange("socio", e.target.value)}
            className={`w-full border rounded-md p-3 bg-white ${camposConError.includes("socio")
              ? "border-red-500"
              : "border-gray-300"
              }`
            }
          />
          <p className="text-xs font-semibold mt-2 text-gray-700">
            *Por favor escriba el nombre completo, no siglas.
          </p>
        </div>

        <div>
          <label className="font-semibold">Sector</label>
          <Dropdown
            value={formData.sector}
            options={sectores}
            onChange={(e) => setFormData({ ...formData, sector: e.value })}
            placeholder="Seleccione el sector"
            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
          />
        </div>

        <div>
          <label className="font-semibold">Tema</label>
          <Dropdown
            value={formData.tema}
            options={temas}
            onChange={(e) => setFormData({ ...formData, tema: e.value, otroTema: e.value === "Otro" ? "" : "" })}
            placeholder="Seleccione el tema"
            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
          />
          {formData.tema === "Otro" && (
            <InputText
              value={formData.otroTema ?? ""}
              onChange={(e) => setFormData({ ...formData, otroTema: e.target.value })}
              placeholder="Escriba el tema"
              className="w-full mt-2"
            />
          )}
        </div>

        <div>
          <label className="font-semibold">Población meta</label>
          <MultiSelect
            value={formData.poblacion_meta}
            options={poblaciones}
            onChange={(e) => {
              const value = e.value;
              const incluyeOtro = value.includes("Otro");
              setFormData({
                ...formData,
                poblacion_meta: value,
                otraPoblacion: incluyeOtro ? "" : "",
              });
            }}
            display="chip"
            placeholder="Seleccione una o varias"
            className="w-full border border-gray-300 rounded-md bg-white text-sm"
          />
          {formData.poblacion_meta.includes("Otro") && (
            <InputText
              value={formData.otraPoblacion ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, otraPoblacion: e.target.value })
              }
              placeholder="Escriba la población"
              className="w-full mt-2"
            />
          )}
          <p className="text-xs font-semibold mt-2 text-gray-700">
            *Puede seleccionar más de una opción.
          </p>
        </div>


        <div>
          <label className="font-semibold">Viceministerio</label>
          <Dropdown
            value={formData.despacho}
            options={despachos}
            onChange={(e) => setFormData({ ...formData, despacho: e.value, otroDespacho: e.value === "Interdisciplinario" ? "" : "" })}
            placeholder="Seleccione el despacho"
            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
          />
          {formData.despacho === "Interdisciplinario" && (
            <InputText
              value={formData.otroDespacho ?? ""}
              onChange={(e) => setFormData({ ...formData, otroDespacho: e.target.value })}
              placeholder="Escriba los viceministerios"
              className="w-full mt-2 bg-gray-100 text-sm border-none rounded-none"
            />
          )}
          <p className="text-xs font-semibold mt-2 text-gray-700">
            *En caso de escribir varios, sepárelos con una coma.
          </p>
        </div>

        <div>
          <label className="font-semibold">Dirección(es) de envío</label>
          <InputText
            value={formData.direccion_envio}
            onChange={(e) => handleChange("direccion_envio", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 bg-white"
          />
          <p className="text-xs font-semibold mt-2 text-gray-700">
            * En caso de ser más de uno, sepárelos con una coma. <br />
            * Favor poner el nombre completo de la dirección. En caso de no saberlo,
            puede consultarlo en el siguiente{" "}
            <a
              href="https://www.mep.go.cr/sites/default/files/2025-05/Organigrama.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition"
            >
              enlace
            </a>.
          </p>
        </div>

        <div>
          <label className="font-semibold">Fecha de inicio</label>
          <Calendar
            value={formData.fecha_inicio}
            onChange={(e) => handleChange("fecha_inicio", e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            className={`w-full border rounded-md p-3 bg-white ${camposConError.includes("fecha_inicio")
              ? "border-red-500"
              : "border-gray-300"
              }`}
          />
        </div>

        <div>
          <label className="font-semibold">Fecha de finalización</label>
          <Calendar
            value={formData.fecha_fin}
            onChange={(e) => handleChange("fecha_fin", e.value)}
            showIcon
            dateFormat="dd/mm/yy"
            className="w-full border border-gray-300 rounded-md p-3 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Funcionario que completó la ficha</label>
          <InputText
            value={formData.funcionario}
            onChange={(e) => handleChange("funcionario", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="font-semibold">Observaciones importantes</label>
          <InputText
            value={formData.observaciones}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-5 bg-white"
          />
        </div>

      </div>
    </Dialog>
  );
}
