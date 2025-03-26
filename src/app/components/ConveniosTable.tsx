"use client";

import { useEffect, useState } from "react";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { ProgressBar } from "primereact/progressbar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import ConvenioDialog from "./ConvenioDialog";
import TimelineModal from "./TimelineModal";
import EditarRegistroDialog from "./EditarRegistroDialog";

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
  nombre: string;
  cooperante: string;
  sector: string;
  consecutivo_numerico: number;
  fase_actual: string; 
}

interface RegistroProceso {
  id: number;
  convenio_id: number;
  entidad_proponente: string;
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

  const [showDialogConvenio, setShowDialogConvenio] = useState(false);
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroProceso>>({});
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedRegistroProceso, setSelectedRegistroProceso] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const [seleccionandoConvenio, setSeleccionandoConvenio] = useState(false);
  const [selectedConvenioParaEliminar, setSelectedConvenioParaEliminar] = useState<Convenio | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  
  const [isMounted, setIsMounted] = useState(false);
  
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      // Obtener convenios desde la API
      const response = await fetch("/api/convenios");
      const data = await response.json();
  
      if (!data || data.error) {
        console.error("Error obteniendo datos:", data.error);
        return;
      }
  
      // Obtener los convenios y los registros de procesos
      const { totalConvenios, totalCooperantes, convenios } = data;
  
      // Obtener registros de procesos desde la API
      const registrosRes = await fetch("/api/registro_procesos");
      const registrosData = await registrosRes.json();
  
      if (!registrosData || registrosData.error) {
        console.error("Error obteniendo registros de procesos:", registrosData.error);
        return;
      }
  
      // Definir el orden de las fases
      const fasesOrdenadas = ["Negociación", "Visto Bueno", "Revisión Técnica", "Análisis Legal", "Verificación Legal", "Firma"];
  
      // Crear un mapa de convenio_id -> fase más avanzada
      const faseMaximaPorConvenio = registrosData.reduce((acc:any, registro:any) => {
        const currentFaseIndex = fasesOrdenadas.indexOf(registro.fase_registro);
        if (!acc[registro.convenio_id] || currentFaseIndex > fasesOrdenadas.indexOf(acc[registro.convenio_id])) {
          acc[registro.convenio_id] = registro.fase_registro;
        }
        return acc;
      }, {} as Record<number, string>);
  
      // Actualizar `fase_actual` en la lista de convenios
      const conveniosActualizados = convenios.map((convenio:any) => ({
        ...convenio,
        fase_actual: faseMaximaPorConvenio[convenio.id] || "Negociación", // Default a "Negociación"
      }));
  
      // Actualizar estados en el frontend
      setConvenios(conveniosActualizados);
      setRegistroProcesos(registrosData);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    }
  };
  
  useEffect(() => {
    setIsMounted(true);
    fetchData();
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  }, []);

  if (!isMounted) {
    return null; 
  }
  
  const updateFaseActual = async (convenioId: number) => {
    try {
      // Obtener la última fase ingresada para este convenio
      const response = await fetch(`/api/registro_procesos?convenioId=${convenioId}&latest=true`);
      const lastFase = await response.json();
  
      if (!lastFase || !lastFase.fase_registro) return;
  
      // Actualizar `fase_actual` en la tabla convenios
      await fetch("/api/convenios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: convenioId, fase_actual: lastFase.fase_registro }),
      });
  
      // Actualizar el estado en React
      setConvenios(convenios.map(c => 
        c.id === convenioId ? { ...c, fase_actual: lastFase.fase_registro } : c
      ));
    } catch (error) {
      console.error("Error actualizando fase_actual:", error);
    }
  };
  
  

  const consecutivoTemplate = (rowData: Convenio) => {
    return (
<span className="flex justify-center items-center bg-[#CDA95F] text-white font-bold text-sm rounded-full w-8 h-8">
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
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const abrirEditarRegistro = (registro:any) => {
    setRegistroSeleccionado(registro);
    setShowEditDialog(true);
  };

  const actualizarRegistroLocal = (registroActualizado: RegistroProceso) => {
    setRegistroProcesos((prevRegistros) => {
      const nuevosRegistros = prevRegistros.map((registro) =>
        registro.id === registroActualizado.id ? registroActualizado : registro
      );
  
      // Recalcular la fase más avanzada del convenio
      const fasesOrdenadas = ["Negociación", "Visto Bueno", "Revisión Técnica", "Análisis Legal", "Verificación Legal", "Firma"];
  
      // Buscar todos los registros del convenio
      const registrosConvenio = nuevosRegistros.filter((r) => r.convenio_id === registroActualizado.convenio_id);
  
      // Determinar la fase más avanzada
      const faseMaxima = registrosConvenio.reduce((maxFase, reg) => {
        return fasesOrdenadas.indexOf(reg.fase_registro) > fasesOrdenadas.indexOf(maxFase) ? reg.fase_registro : maxFase;
      }, "Negociación");
  
      // Actualizar `fase_actual` en convenios
      setConvenios((prevConvenios) =>
        prevConvenios.map((c) =>
          c.id === registroActualizado.convenio_id ? { ...c, fase_actual: faseMaxima } : c
        )
      );
  
      return nuevosRegistros;
    });
  };
  
  
  const handleAddRegistro = async () => {
    if (!selectedConvenioId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se ha seleccionado un convenio.",
        life: 3000,
      });
      return;
    }
  
    const registroData = {
      ...newRegistro,
      convenio_id: selectedConvenioId,
      fecha_inicio: newRegistro.fecha_inicio ? new Date(newRegistro.fecha_inicio).toISOString().split("T")[0] : null,
      fecha_final: newRegistro.fecha_final ? new Date(newRegistro.fecha_final).toISOString().split("T")[0] : null,
    };
  
    try {
      const response = await fetch("/api/registro_procesos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registroData),
      });
  
      if (!response.ok) throw new Error("Error al insertar registro");
  
      // Actualizar la fase del convenio después de insertar el nuevo registro
      await updateFaseActual(selectedConvenioId);
  
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro guardado correctamente",
        life: 2000,
      });
  
      await fetchData(); 
      setShowDialog(false);
      setNewRegistro({});
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar el registro.",
        life: 3000,
      });
    }
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
        onClick={() => {
          handleAddRegistro();
        }}
        className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105" 
      />
    </div>
  );
  const handleDeleteConvenio = async () => {
    if (!selectedConvenioParaEliminar) return;
  
    try {
      const response = await fetch(`/api/convenios?id=${selectedConvenioParaEliminar.id}`, { method: "DELETE" });
  
      if (!response.ok) throw new Error("Error al eliminar el convenio");
  
      setConvenios(convenios.filter((convenio) => convenio.id !== selectedConvenioParaEliminar.id));
      setShowConfirmDialog(false);
      setSeleccionandoConvenio(false);
      setSelectedConvenioParaEliminar(null);
  
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Convenio eliminado correctamente",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el convenio",
        life: 3000,
      });
    }
  };
  
  
  
  const activarSeleccionConvenio = () => {
    setSeleccionandoConvenio(!seleccionandoConvenio);
    setSelectedConvenioParaEliminar(null); 
  };

  const onRowClick = (event: { data: Convenio }) => {
    if (!seleccionandoConvenio) return; 
  
    setSelectedConvenioParaEliminar(event.data);
    setShowConfirmDialog(true);
  };
   
  const confirmarEliminarConvenio = () => {
    if (!selectedConvenioParaEliminar) {
      toast.current?.show({ severity: "warn", summary: "Atención", detail: "Seleccione un convenio", life: 3000 });
      return;
    }
    setShowConfirmDialog(true);
  };

  const onSelectionChange = (e:any) => {
    if (!seleccionandoConvenio) return; 
  
    setSelectedConvenioParaEliminar(e.value); 
    setShowConfirmDialog(true); 
  };
  
  
  
  const handleDeleteRegistro = async (id: number) => {
    try {
      const response = await fetch(`/api/registro_procesos?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el registro");
      setRegistroProcesos(registroProcesos.filter((registro) => registro.id !== id));
    } catch (error) {
      console.error("Error eliminando registro:", error);
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
            className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"             onClick={() => {
              setSelectedConvenioId(rowData.id);
              setShowDialog(true);
            }}
          />
        </div>

        <DataTable value={registros} dataKey="id" responsiveLayout="scroll" className="text-xs">
          <Column field="entidad_proponente" header="Entidad Proponente" sortable editor={textEditor} />
          <Column field="funcionario_emisor" header="Autoridad Ministerial" sortable editor={textEditor} />
          <Column field="autoridad_ministerial" header="Funcionario Emisor" sortable editor={textEditor} />
          <Column field="entidad_emisora" header="Entidad Emisora" sortable editor={textEditor} />
          <Column field="funcionario_receptor" header="Funcionario Receptor" sortable editor={textEditor} />
          <Column field="entidad_receptora" header="Entidad Receptora"  editor={textEditor} />
          <Column 
  field="registro_proceso" 
  header="Registro del Proceso" 
  body={(rowData) => (
    <span 
      className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition"
      onClick={() => {
        setSelectedRegistroProceso(rowData.id); 
        setShowTimeline(true);
      }}
    >
      {rowData.registro_proceso}
    </span>
  )}
  style={{ width: "250px" }} 
/>
          <Column field="fecha_inicio" header="Fecha Inicio" editor={textEditor} body={(rowData) => formatDate(rowData.fecha_inicio)} sortable />
          <Column field="tipo_convenio" header="Tipo de Convenio" editor={textEditor} />
          <Column field="fase_registro" header="Fase" body={faseRegistroTemplate} sortable />
          <Column
          header="Acciones"
          body={(rowData) => (
            <Button
              icon="pi pi-pencil"
              className="p-button-rounded p-button-warning p-button-sm"
              onClick={() => abrirEditarRegistro(rowData)}
            />
          )}
        />          <Column body={(rowData) => (
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
      <div className="flex justify-between items-center mb-4">
  {/* Buscador */}
  <div className="flex items-center gap-2 w-full max-w-md">
    <i className="pi pi-search text-gray-500" />
    <InputText
      value={globalFilter}
      onChange={(e) => {
        setGlobalFilter(e.target.value);
        setFilters({ global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } });
      }}
      placeholder="Buscar"
      className="p-inputtext-sm w-full border border-gray-400 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
    />
  </div>

  <div className="flex justify-between items-center mb-4">
  {/* Contenedor de botones alineados */}
  <div className="flex gap-4 mb-4">
  <Button 
    label="Añadir Convenio" 
    icon="pi pi-plus" 
    className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
    onClick={() => setShowDialogConvenio(true)}
  />
  
  <Button 
  label="Eliminar Convenio" 
  icon="pi pi-trash" 
  className="p-button-danger font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform bg-red-600 hover:bg-red-700 text-white"
  onClick={activarSeleccionConvenio}
/>

</div>


</div>

</div>

<DataTable
  value={convenios}
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
  rowExpansionTemplate={rowExpansionTemplate}
  dataKey="id"
  paginator
  rows={5}
  filters={filters}
  globalFilterFields={["nombre", "cooperante", "sector", "consecutivo_numerico"]}
  responsiveLayout="scroll"
  className={`custom-table ${seleccionandoConvenio ? "cursor-pointer" : ""}`}
  selectionMode={seleccionandoConvenio ? "single" : undefined} 
  selection={selectedConvenioParaEliminar}
  onSelectionChange={onSelectionChange} 
>
  {seleccionandoConvenio && <Column selectionMode="single" headerStyle={{ width: "3rem" }} className="p-selection-column"/>}
  <Column expander style={{ width: "5rem" }} />
  <Column field="consecutivo_numerico" header="Registro" body={consecutivoTemplate} sortable />
  <Column field="nombre" header="Nombre" sortable />
  <Column field="cooperante" header="Cooperante" sortable />
  <Column field="sector" header="Sector" sortable />
  <Column field="fase_actual" header="Progreso" body={faseProgreso} sortable />
</DataTable>


      <Dialog
  header="Añadir Registro"
  visible={showDialog}
  style={{ width: "50vw" }}
  footer={dialogFooter}
  onHide={() => setShowDialog(false)}
  className="p-dialog-custom"
>
  <div className="grid grid-cols-2 gap-4 p-6">

     {/* Entidad proponente */}
     <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Entidad proponente</label>
      <InputText 
        className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
        placeholder="Entidad proponente" 
        onChange={(e) => setNewRegistro({ ...newRegistro, entidad_proponente: e.target.value })} 
      />
    </div>
    
  {/* Autoridad Ministerial */}
  <div className="flex flex-col">
  <label className="font-semibold text-gray-600 mb-1">Autoridad Ministerial</label>
  <Dropdown
    className="p-inputtext-sm p-2 border border-gray-300 rounded-lg"
    value={newRegistro.autoridad_ministerial}
    options={[
      { label: "Ministro de Educación Pública", value: "Ministro de Educación Pública" },
      { label: "Viceministerio Académico de Educación Pública", value: "Viceministerio Académico de Educación Pública" },
      { label: "Viceministerio Administrativo de Educación Pública", value: "Viceministerio Administrativo de Educación Pública" },
      { label: "Viceministerio de Planificación y Coordinación Regional", value: "Viceministerio de Planificación y Coordinación Regional" },
    ]}
    placeholder="Seleccione la Autoridad Ministerial"
    onChange={(e) => setNewRegistro({ ...newRegistro, autoridad_ministerial: e.value })}
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
  <Dropdown 
    className="p-inputtext-sm p-2 border border-gray-300 rounded-lg appearance-none"
    value={newRegistro.tipo_convenio} 
    options={[{ label: "Marco", value: "Marco" }, { label: "Específico", value: "Específico" }, { label: "Adenda", value: "Adenda" }]}
    placeholder="Seleccione el Tipo de Convenio"
    onChange={(e) => setNewRegistro({ ...newRegistro, tipo_convenio: e.value })}
  />
</div>

    {/* Fecha Inicio */}
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-1">Fecha Inicio</label>
      <Calendar 
        className="p-inputtext-sm border border-gray-300 rounded-lg p-2"
        placeholder="Seleccionar fecha"
        showIcon
        onChange={(e) => 
          setNewRegistro({ 
            ...newRegistro, 
            fecha_inicio: e.value ? new Date(e.value).toISOString().split("T")[0] : "" 
          }) 
        }
              />
    </div>

{/* Registro del Proceso */}
<div className="flex flex-col col-span-2">
  <label className="font-semibold text-gray-600 mb-1">Registro del Proceso</label>
  <textarea
    className="p-inputtext-sm w-full border border-gray-300 rounded-lg p-2 bg-white resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    placeholder="Ingrese detalles del proceso"
    value={newRegistro.registro_proceso || ""}
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

<Dialog
  visible={showConfirmDialog}
  style={{ width: "450px" }}
  header="Confirmar Eliminación"
  modal
  footer={
    <div className="flex justify-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowConfirmDialog(false)} className="p-button-text" />
      <Button label="Eliminar" icon="pi pi-check" className="p-button-danger" onClick={handleDeleteConvenio} />
    </div>
  }
  onHide={() => setShowConfirmDialog(false)}
>
  {selectedConvenioParaEliminar && (
    <div>
      <p className="text-gray-700">¿Seguro que quieres eliminar este convenio?</p>
      <p className="font-semibold text-red-600">{selectedConvenioParaEliminar.nombre}</p>
    </div>
  )}
</Dialog>


<TimelineModal 
  visible={showTimeline} 
  onHide={() => setShowTimeline(false)} 
  registroProcesoId={selectedRegistroProceso ? Number(selectedRegistroProceso) : null}
/>
<ConvenioDialog visible={showDialogConvenio} onHide={() => setShowDialogConvenio(false)} onRefresh={fetchData} />
<EditarRegistroDialog
  visible={showEditDialog}
  onHide={() => setShowEditDialog(false)}
  registro={registroSeleccionado}
  onSave={actualizarRegistroLocal}
/>

    </>
  );
}
