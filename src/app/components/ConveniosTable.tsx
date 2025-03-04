"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { ProgressBar } from "primereact/progressbar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRef } from "react";


const fases = [
  { label: "Negociación", value: "Negociación" },
  { label: "Visto Bueno", value: "Visto Bueno" },
  { label: "Revisión Técnica", value: "Revisión Técnica" },
  { label: "Análisis Legal", value: "Análisis Legal" },
  { label: "Verificación Legal", value: "Verificación Legal" },
  { label: "Firma", value: "Firma" },
];

interface Convenio {
  id: number;
  cooperante: string;
  sector: string;
  consecutivo_numerico: number;
  fase_actual: string; 
}

interface RegistroProceso {
  id: number;
  convenio_id: number;
  autoridad_ministerial: string;
  funcionario_emisor: string;
  entidad_emisora: string;
  funcionario_receptor: string;
  entidad_receptora: string;
  registro_proceso: string;
  fecha_inicio: string;
  fecha_final: string;
  tipo_convenio: string;
  fase_registro: string;
}

export default function ConveniosTable() {
  const toast = useRef<Toast>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [registroProcesos, setRegistroProcesos] = useState<RegistroProceso[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroProceso>>({});
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: conveniosData } = await supabase.from("convenios").select("*");
      setConvenios(conveniosData || []);

      const { data: registroData } = await supabase.from("registro_procesos").select("*");
      setRegistroProcesos(registroData || []);
    }

    fetchData();

    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  }, []);

  const consecutivoTemplate = (rowData: Convenio) => {
    return (
      <span className="flex justify-center items-center bg-blue-500 text-white font-bold text-sm rounded-full w-8 h-8">
        {rowData.consecutivo_numerico}
      </span>
    );
  };
  const faseProgreso = (rowData: Convenio) => {
    const fases = ["Negociación", "Visto Bueno", "Revisión Técnica", "Análisis Legal", "Verificación Legal", "Firma"];
    const faseIndex = fases.indexOf(rowData.fase_actual);
    const progress = ((faseIndex + 1) / fases.length) * 100;
  
    return <ProgressBar value={progress} className="w-32 h-3" showValue={false} />;
  };
  
  const faseRegistroTemplate = (rowData: RegistroProceso) => {
    const faseColors: Record<string, string> = {
      "Negociación": "bg-blue-200 text-blue-800",
      "Visto Bueno": "bg-green-200 text-green-800",
      "Revisión Técnica": "bg-yellow-200 text-yellow-800",
      "Análisis Legal": "bg-orange-200 text-orange-800",
      "Verificación Legal": "bg-red-200 text-red-800",
      "Firma": "bg-purple-200 text-purple-800",
    };
  
    const colorClass = faseColors[rowData.fase_registro] || "bg-gray-200 text-gray-800";
  
    return (
      <span
        className={`flex justify-center items-center px-3 py-1 rounded-md text-xs font-semibold text-center w-full whitespace-nowrap ${colorClass}`}
      >
        {rowData.fase_registro}
      </span>
    );
  };
  
  
  
  const updateFaseActual = async (convenioId: number) => {
    const { data: lastFase, error } = await supabase
      .from("registro_procesos")
      .select("fase_registro")
      .eq("convenio_id", convenioId)
      .order("id", { ascending: false }) // Obtener la última fase ingresada
      .limit(1)
      .single();
  
    if (error) {
      console.error("Error obteniendo última fase:", error.message);
      return;
    }
  
    if (lastFase) {
      const { error: updateError } = await supabase
        .from("convenios")
        .update({ fase_actual: lastFase.fase_registro })
        .eq("id", convenioId);
  
      if (updateError) {
        console.error("Error actualizando fase_actual:", updateError.message);
      } else {
        setConvenios(convenios.map(c => 
          c.id === convenioId ? { ...c, fase_actual: lastFase.fase_registro } : c
        ));
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return ""; // Evita errores con valores nulos o vacíos
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAddRegistro = async () => {
    if (!selectedConvenioId) return;
  
    const convenio = convenios.find((c) => c.id === selectedConvenioId);
    if (!convenio) return;
  
    const { data, error } = await supabase.from("registro_procesos").insert([
      {
        ...newRegistro,
        convenio_id: selectedConvenioId,
        fase_registro: newRegistro.fase_registro, // Usa la fase seleccionada en el diálogo
        fecha_inicio: newRegistro.fecha_inicio ? (newRegistro.fecha_inicio as Date).toISOString() : null,
        fecha_final: newRegistro.fecha_final ? (newRegistro.fecha_final as Date).toISOString() : null,
      },
    ]);
  
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `No se pudo guardar el registro: ${error.message}`,
        life: 3000,
      });
      return;
    }
  
    // 🔹 Obtener la última fase del convenio después de insertar el registro
    const { data: latestFaseData, error: latestFaseError } = await supabase
      .from("registro_procesos")
      .select("fase_registro")
      .eq("convenio_id", selectedConvenioId)
      .order("id", { ascending: false }) // Obtener la última fase registrada
      .limit(1);
  
    if (latestFaseError) {
      console.error("Error obteniendo la última fase:", latestFaseError.message);
      return;
    }
  
    const ultimaFase = latestFaseData?.[0]?.fase_registro;
  
    if (ultimaFase) {
      // 🔹 Actualizar la fase del convenio con la última fase del registro
      const { error: updateError } = await supabase
        .from("convenios")
        .update({ fase_actual: ultimaFase })
        .eq("id", selectedConvenioId);
  
      if (updateError) {
        console.error("Error actualizando la fase del convenio:", updateError.message);
        return;
      }
    }
  
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: "Registro guardado correctamente",
      life: 2000, // El mensaje se oculta después de 2 segundos
    });
  
    setTimeout(() => {
      window.location.reload(); // Recargar la página después de mostrar el mensaje
    }, 2000);
  
    setShowDialog(false); // Cierra el diálogo después de guardar
    setNewRegistro({}); // Limpia los campos del formulario
  };
  
  
  
  const dialogFooter = (
    <div className="flex justify-end gap-2 p-4">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={() => setShowDialog(false)}
        className="p-button-text p-button-secondary"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleAddRegistro} 
        className="p-button-success"
      />
    </div>
  );

  const handleDeleteRegistro = async (id: number) => {
    const { error } = await supabase.from("registro_procesos").delete().eq("id", id);
    if (error) {
      console.error("Error eliminando registro:", error.message);
    } else {
      setRegistroProcesos(registroProcesos.filter((registro) => registro.id !== id));
    }
  };

  
  const handleEditRegistro = async (e: DataTableRowEditCompleteEvent) => {
    const updatedRegistro = {
      ...e.newData,
    };
  
    if (!updatedRegistro.id) {
      console.error("Error: ID es necesario para editar.");
      return;
    }
  
    const { error } = await supabase
      .from("registro_procesos")
      .update(updatedRegistro)
      .eq("id", updatedRegistro.id);
  
    if (error) {
      console.error("Error editando registro:", error.message);
    } else {
      setRegistroProcesos(
        registroProcesos.map((r) => (r.id === updatedRegistro.id ? updatedRegistro : r))
      );
  
      // 🔄 Después de editar, actualizar la fase_actual del convenio
      await updateFaseActual(updatedRegistro.convenio_id);
    }
  };
  


  const textEditor = (options: any) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const rowExpansionTemplate = (rowData: Convenio) => {
    const registros = registroProcesos.filter((registro) => registro.convenio_id === rowData.id);

    return (
      <div className="p-4 text-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Registros del Convenio</h3>
          <Button
            label="Añadir Registro"
            icon="pi pi-plus"
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            onClick={() => {
              setSelectedConvenioId(rowData.id);
              setShowDialog(true);
            }}
          />
        </div>

        <DataTable
          value={registros}
          editMode="row"
          dataKey="id"
          responsiveLayout="scroll"
          className="text-xs"
          onRowEditComplete={handleEditRegistro}
        >
          <Column field="funcionario_emisor" header="Autoridad Ministerial" sortable editor={textEditor} />
          <Column field="autoridad_ministerial" header="Funcionario Emisor" sortable editor={textEditor} />
          <Column field="entidad_emisora" header="Entidad Emisora" sortable editor={textEditor} />
          <Column field="funcionario_receptor" header="Funcionario Receptor" sortable editor={textEditor} />
          <Column field="entidad_receptora" header="Entidad Receptora"  editor={textEditor} />
          <Column field="registro_proceso" header="Registro del Proceso" editor={textEditor} style={{ width: "250px" }} />
          <Column field="fecha_inicio" header="Fecha Inicio" editor={textEditor} body={(rowData) => formatDate(rowData.fecha_inicio)} sortable />
          <Column field="fecha_final" header="Fecha Final" editor={textEditor} body={(rowData) => formatDate(rowData.fecha_final)} sortable />
          <Column field="tipo_convenio" header="Tipo de Convenio" editor={textEditor} />
          <Column field="fase_registro" header="Fase" body={faseRegistroTemplate} sortable />

          <Column
  rowEditor
  headerStyle={{ width: "4rem", textAlign: "center" }}
  bodyStyle={{ textAlign: "center" }}
/>
          <Column
            body={(rowData) => (
              <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleDeleteRegistro(rowData.id)} />
            )}
            style={{ textAlign: "center", width: "50px" }}
          />
        </DataTable>
      </div>
    );
  };

  return (
    <>
      <Panel header="Lista de Convenios">
        <div className="mb-4 flex items-center gap-2">
          <i className="pi pi-search text-gray-500" />
          <InputText
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setFilters({ global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } });
            }}
            placeholder="Buscar"
            className="p-inputtext-sm w-full max-w-sm border border-gray-400 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        <DataTable
          value={convenios}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          paginator rows={10}
          filters={filters}
          globalFilterFields={["cooperante", "sector"]}
          responsiveLayout="scroll"
          className="custom-table"
        >
          <Column expander style={{ width: "5rem" }} />
          <Column field="consecutivo_numerico" header="Consecutivo" body={consecutivoTemplate} sortable />
          <Column field="cooperante" header="Cooperante" sortable />
          <Column field="sector" header="Sector" sortable />
          <Column field="fase_actual" header="Progreso" body={faseProgreso} sortable />
          </DataTable>
      </Panel>
      <Dialog
  header="Añadir Registro"
  visible={showDialog}
  style={{ width: "50vw" }}
  footer={dialogFooter}
  onHide={() => setShowDialog(false)}
  className="p-dialog-custom"
>
  <div className="grid grid-cols-2 gap-4 p-6">
    
    {/* Autoridad Ministerial */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Autoridad Ministerial</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Autoridad Ministerial" 
        onChange={(e) => setNewRegistro({ ...newRegistro, autoridad_ministerial: e.target.value })} 
      />
    </div>

    {/* Funcionario Emisor */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Funcionario Emisor</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Funcionario Emisor" 
        onChange={(e) => setNewRegistro({ ...newRegistro, funcionario_emisor: e.target.value })} 
      />
    </div>

    {/* Entidad Emisora */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Entidad Emisora</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Entidad Emisora" 
        onChange={(e) => setNewRegistro({ ...newRegistro, entidad_emisora: e.target.value })} 
      />
    </div>

    {/* Funcionario Receptor */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Funcionario Receptor</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Funcionario Receptor" 
        onChange={(e) => setNewRegistro({ ...newRegistro, funcionario_receptor: e.target.value })} 
      />
    </div>

    {/* Entidad Receptora */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Entidad Receptora</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Entidad Receptora" 
        onChange={(e) => setNewRegistro({ ...newRegistro, entidad_receptora: e.target.value })} 
      />
    </div>

    {/* Tipo de Convenio */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Tipo de Convenio</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Tipo de Convenio" 
        onChange={(e) => setNewRegistro({ ...newRegistro, tipo_convenio: e.target.value })} 
      />
    </div>

    {/* Fecha Inicio */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Fecha Inicio</label>
      <Calendar 
        className="p-inputtext-sm border border-gray-300 rounded-lg p-2"
        placeholder="Seleccionar fecha"
        showIcon
        onChange={(e) => setNewRegistro({ ...newRegistro, fecha_inicio: e.value as Date })} 
      />
    </div>

    {/* Fecha Final */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Fecha Final</label>
      <Calendar 
        className="p-inputtext-sm border border-gray-300 rounded-lg p-2"
        placeholder="Seleccionar fecha"
        showIcon
        onChange={(e) => setNewRegistro({ ...newRegistro, fecha_final: e.value as Date })} 
      />
    </div>

    {/* Registro del Proceso */}
    <div className="flex flex-col col-span-2">
      <label className="font-semibold text-gray-600 mb-1">Registro del Proceso</label>
      <textarea 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg resize-none h-20"
        placeholder="Escribe el detalle del proceso"
        onChange={(e) => setNewRegistro({ ...newRegistro, registro_proceso: e.target.value })}
      />
    </div>

    {/* Selección de Fase del Registro */}
    <div className="flex flex-col col-span-2">
      <label className="font-semibold text-gray-600 mb-1">Fase del Registro</label>
      <Dropdown 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        options={fases}
        placeholder="Seleccione una fase"
        value={newRegistro.fase_registro}
        onChange={(e) => setNewRegistro({ ...newRegistro, fase_registro: e.value })}
      />
    </div>
  </div>
</Dialog>

    </>
  );
}
