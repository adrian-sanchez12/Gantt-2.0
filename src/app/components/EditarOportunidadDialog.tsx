"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";

interface EditarOportunidadDialogProps {
    visible: boolean;
    onHide: () => void;
    registro: any;
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
    { label: "Otro (escribir)", value: "Otro" },
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
    { label: "Otro (escribir)", value: "Otro" },
];

const despachos = [
    { label: "Ministro", value: "Ministro" },
    { label: "Académico", value: "Académico" },
    { label: "Administrativo", value: "Administrativo" },
    { label: "Planificación Institucional y Coordinación Regional", value: "Planificación y Coordinación Regional" },
];

const poblaciones = [
    { label: "Estudiantes", value: "Estudiantes" },
    { label: "Docentes", value: "Docentes" },
    { label: "Asesores", value: " Asesores" },
    { label: "Autoridades MEP", value: "Autoridades MEP" },
    { label: "Directores MEP", value: "Directores MEP" },
    { label: "Otro (escribir)", value: "Otro" },
];

export default function EditarOportunidadDialog({
    visible,
    onHide,
    registro,
    onSave,
}: EditarOportunidadDialogProps) {
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
                //Lo mismo que el agregar, permite que lo que se escriba en otro se agregue directo a la base de datos
                tipo_oportunidad:
                    formData.tipo_oportunidad === "Otro" ? formData.otroTipo : formData.tipo_oportunidad,
                sector:
                    formData.sector === "Otro" ? formData.otroSector : formData.sector,
                tema:
                    formData.tema === "Otro" ? formData.otroTema : formData.tema,
                poblacion_meta:
                    formData.poblacion_meta === "Otro" ? formData.otraPoblacion : formData.poblacion_meta,
                fecha_inicio: formatDate(formData.fecha_inicio),
                fecha_fin: formatDate(formData.fecha_fin),
            };

            const response = await fetch("/api/oportunidades", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error al actualizar la oportunidad");

            onSave();
            onHide();
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
        }
    };

    return (
        <Dialog
            header="Editar oportunidad profesional"
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
                        <label className="font-semibold">Nombre de la oportunidad</label>
                        <InputText
                            value={formData.nombre_oportunidad}
                            onChange={(e) => handleChange("nombre_oportunidad", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-5 bg-white"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="font-semibold">Objetivo</label>
                        <InputText
                            value={formData.objetivo}
                            onChange={(e) => handleChange("objetivo", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-5 bg-white"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Modalidad</label>
                        <Dropdown
                            value={formData.modalidad}
                            options={modalidades}
                            onChange={(e) => setFormData({ ...formData, modalidad: e.value })}
                            placeholder="Seleccione la modalidad"
                            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
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
                                value={formData.otroTipo}
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
                            className="w-full border border-gray-300 rounded-md p-2 bg-white"
                        />
                        <p className="text-xs font-semibold mt-2 text-gray-700">
                            Por favor escriba el nombre completo, no siglas.
                        </p>
                    </div>

                    <div>
                        <label className="font-semibold">Sector de cooperación</label>
                        <Dropdown
                            value={formData.sector}
                            options={sectores}
                            onChange={(e) => setFormData({ ...formData, sector: e.value, otroSector: e.value === "Otro" ? "" : "" })}
                            placeholder="Seleccione el sector"
                            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
                        />
                        {formData.sector === "Otro" && (
                            <InputText
                                value={formData.otroSector}
                                onChange={(e) => setFormData({ ...formData, otroSector: e.target.value })}
                                placeholder="Escriba el sector"
                                className="w-full mt-2"
                            />
                        )}
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
                                value={formData.otroTema}
                                onChange={(e) => setFormData({ ...formData, otroTema: e.target.value })}
                                placeholder="Escriba el tema"
                                className="w-full mt-2"
                            />
                        )}
                    </div>

                    <div>
                        <label className="font-semibold">Población meta</label>
                        <Dropdown
                            value={formData.poblacion_meta}
                            options={poblaciones}
                            onChange={(e) => setFormData({ ...formData, poblacion_meta: e.value, otraPoblacion: e.value === "Otro" ? "" : "" })}
                            placeholder="Seleccione la población meta"
                            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
                        />
                        {formData.poblacion_meta === "Otro" && (
                            <InputText
                                value={formData.otraPoblacion}
                                onChange={(e) => setFormData({ ...formData, otraPoblacion: e.target.value })}
                                placeholder="Escriba la población"
                                className="w-full mt-2"
                            />
                        )}
                    </div>

                    <div>
                        <label className="font-semibold">Despacho:</label>
                        <Dropdown
                            value={formData.despacho}
                            options={despachos}
                            onChange={(e) => setFormData({ ...formData, despacho: e.value })}
                            placeholder="Seleccione el despacho"
                            className="w-full border border-gray-300 rounded-md py-0 px-2 bg-white text-sm"
                        />
                    </div>


                    <div>
                        <label className="font-semibold">Dirección(es) de envío</label>
                        <InputText
                            value={formData.direccion_envio}
                            onChange={(e) => handleChange("direccion_envio", e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 bg-white"
                        />
                        <p className="text-xs font-semibold mt-2 text-gray-700">
                            Por favor escriba el nombre directo de la dirección.
                        </p>
                    </div>

                    <div>
                        <label className="font-semibold">Fecha de inicio</label>
                        <Calendar
                            //Permite que la fecha se cargue de nuevo.
                            value={formData.fecha_inicio ? new Date(formData.fecha_inicio) : undefined}
                            onChange={(e) => handleChange("fecha_inicio", e.value)}
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full border border-gray-300 rounded-md p-2 bg-white"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Fecha de finalización</label>
                        <Calendar
                            value={formData.fecha_fin ? new Date(formData.fecha_fin) : undefined}
                            onChange={(e) => handleChange("fecha_fin", e.value)}
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full border border-gray-300 rounded-md p-2 bg-white"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="font-semibold">Funcionario que completó la ficha</label>
                        <InputText
                            value={formData.funcionario}
                            onChange={(e) => handleChange("funcionario", e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 bg-white"
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
}
