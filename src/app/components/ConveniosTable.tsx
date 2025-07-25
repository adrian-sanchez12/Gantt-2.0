"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { ProgressBar } from "primereact/progressbar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import ConvenioDialog from "./ConvenioDialog";
import TimelineModal from "./TimelineModal";
import EditarRegistroDialog from "./EditarRegistroDialog";
import EditarConvenioDialog from "./EditarConvenioDialog";

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
  doc_pdf: string; 
}


export default function ConveniosTable() {
  const toast = useRef<Toast>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [registroProcesos, setRegistroProcesos] = useState<RegistroProceso[]>([]);
  const [expandedRows, setExpandedRows] = useState<any>(null); // Cambio aquí
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDialogConvenio, setShowDialogConvenio] = useState(false);
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroProceso>>({});
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedRegistroProceso, setSelectedRegistroProceso] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroProceso | null>(null);
  const [showConfirmDialogRegistro, setShowConfirmDialogRegistro] = useState(false);
  const [registroProcesoAEliminar, setRegistroProcesoAEliminar] = useState<RegistroProceso | null>(null);
  const [seleccionandoConvenio, setSeleccionandoConvenio] = useState(false);
  const [selectedConvenioParaEliminar, setSelectedConvenioParaEliminar] = useState<Convenio | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditConvenioDialog, setShowEditConvenioDialog] = useState(false);
  const [selectedConvenioParaEditar, setSelectedConvenioParaEditar] = useState<Convenio | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  
  // Opciones para el filtro de FASE
  const opcionesFase = [
  { label: "Todas las fases", value: "" },
  { label: "Negociación", value: "Negociación" },
  { label: "Visto Bueno", value: "Visto Bueno" },
  { label: "Revisión Técnica", value: "Revisión Técnica" },
  { label: "Análisis Legal", value: "Análisis Legal" },
  { label: "Verificación Legal", value: "Verificación Legal" },
  { label: "Firma", value: "Firma" },
];

// Estados de filtro de FASE
const [faseFiltro, setFaseFiltro] = useState("");

// Opciones para el filtro de SECTOR
const opcionesSector = [
  { label: "Todos los sectores", value: "" },
  { label: "Bilateral", value: "Bilateral" },
  { label: "Sociedad Civil", value: "Sociedad Civil" },
  { label: "Privado", value: "Privado" },
  { label: "Público", value: "Público" },
  { label: "Academia", value: "Academia" },
  { label: "Multilateral Regional", value: "Multilateral Regional" },
  { label: "Multilateral Naciones Unidas", value: "Multilateral Naciones Unidas" },
  { label: "Otro", value: "Otro" },
];

// Estado para el filtro de sector
const [sectorFiltro, setSectorFiltro] = useState<string>("");

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
  
      // Definir el orden de las FASES
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

  // Eliminar Convenio
  const handleDeleteConvenio = async () => {
    if (!selectedConvenioParaEliminar) return;
  
    try {
      const response = await fetch(`/api/convenios?id=${selectedConvenioParaEliminar.id}`, {
      method: "DELETE", 
    });
  
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
  
  // Activa o desactiva el modo "Eliminar Convenio"
  const activarSeleccionConvenio = () => {
  setSeleccionandoConvenio(!seleccionandoConvenio);
  setSelectedConvenioParaEliminar(null);
};
  
  // Para confirmar antes de eliminar
  const confirmarEliminarConvenio = () => {
    if (!selectedConvenioParaEliminar) {
      toast.current?.show({ 
        severity: "warn", 
        summary: "Atención", 
        detail: "Seleccione un convenio", 
        life: 3000, 
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  // Selección para eliminar
  const handleSeleccionEliminar = (e: any) => {
  if (!seleccionandoConvenio) return; // Solo actúa en modo eliminar
  setSelectedConvenioParaEliminar(e.value);
};

// Eliminar Registro de Convenio
  const handleDeleteRegistro = async (id: number) => {
    try {
      const response = await fetch(`/api/registro_procesos?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el registro");
      setRegistroProcesos(registroProcesos.filter((registro) => registro.id !== id));
    } catch (error) {
      console.error("Error eliminando registro:", error);
    }
  };

  //Para abrir el modal de Editar Convenio
  const abrirDialogoEdicion = () => {
  if (!selectedConvenioParaEditar) {
    toast.current?.show({
      severity: "warn",
      summary: "Atención",
      detail: "Seleccione un convenio para editar",
      life: 3000,
    });
    return;
  }
  setShowEditConvenioDialog(true);
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

// Subir PDF
const handleFileUpload = async (event: any, rowData: any) => {
  event.stopPropagation && event.stopPropagation();
  event.preventDefault && event.preventDefault();
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", rowData.id);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo subir el archivo", life: 3000 });
      return;
    }

    const { url } = await response.json();

    await fetch("/api/registro_procesos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowData.id, doc_pdf: url }),
    });

    toast.current?.show({ severity: "success", summary: "Éxito", detail: "Archivo subido correctamente", life: 3000 });
    fetchData(); // Refresca la tabla de registros
  } catch (error) {
    toast.current?.show({ severity: "error", summary: "Error", detail: "Hubo un problema al subir el PDF", life: 3000 });
  }
};

// Click del ícono para abrir el input file
const handleIconClick = (rowData: any) => {
  fileInputRefs.current[rowData.id]?.click();
};

// Eliminar PDF
const handleDeletePDF = async (rowData: any) => {
  try {
    await fetch("/api/registro_procesos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowData.id, doc_pdf: "" }),
    });

    toast.current?.show({ severity: "info", summary: "Documento eliminado", detail: "El PDF ha sido eliminado", life: 3000 });
    fetchData();
  } catch (error) {
    toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el PDF", life: 3000 });
  }
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
            className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              setSelectedConvenioId(rowData.id);
              setShowDialog(true);
            }}
          />
        </div>

  <DataTable value={registros} dataKey="id" responsiveLayout="scroll" className="text-xs">
  <Column field="entidad_proponente" header="Entidad Proponente" sortable editor={textEditor} />
  <Column field="autoridad_ministerial" header="Autoridad Ministerial" sortable editor={textEditor} />
  <Column field="funcionario_emisor" header="Funcionario Emisor" sortable editor={textEditor} />
  <Column field="entidad_emisora" header="Entidad Emisora" sortable editor={textEditor} />
  <Column field="funcionario_receptor" header="Funcionario Receptor" sortable editor={textEditor} />
  <Column field="entidad_receptora" header="Entidad Receptora" editor={textEditor} />
  <Column
   field="registro_proceso"
   header="Registro del Proceso"
   body={(rowData) => (
      <span
        className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition"
         onClick={() => {
            setSelectedRegistroProceso(rowData.id);
            setShowTimeline(true);
                }}>
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
        <div className="flex gap-2 items-center">
            <Button
              icon="pi pi-pencil"
              className="p-button-rounded p-button-warning p-button-sm"
              onClick={() => abrirEditarRegistro(rowData)}
              tooltip="Editar"
              />

      {/* SUBIR/VER/ELIMINAR PDF */}
      {rowData.doc_pdf ? (
          <>
          <a
          href={rowData.doc_pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 transition"
          title="Ver PDF"
          >
           📄
            </a>
             <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => handleDeletePDF(rowData)}
                tooltip="Eliminar PDF"
                />
            </>
                ) : (
            <>
              <Button
                icon="pi pi-upload"
                className="p-button-rounded p-button-info p-button-sm"
                onClick={() => handleIconClick(rowData)}
                tooltip="Subir PDF"
                />
                <input
                type="file"
                accept="application/pdf"
                ref={(el) => {
                  if (el) {
                    fileInputRefs.current[rowData.id] = el;
                     }
                  }}   
                  onChange={(event) => handleFileUpload(event, rowData)}
                  style={{ display: "none" }}
                />
             </>
                )}
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger p-button-sm"
                  onClick={() => {
                    setRegistroProcesoAEliminar(rowData); 
                    setShowConfirmDialogRegistro(true);
                  }}
                  tooltip="Eliminar"
                />
              </div>
            )}
            style={{ textAlign: "center", width: "180px" }}
          />
        </DataTable>
      </div>
    );
  };

  const conveniosFiltrados = convenios.filter(c => {
  const filtraBusqueda =
    !globalFilter ||
    c.nombre?.toLowerCase().includes(globalFilter.toLowerCase()) ||
    c.cooperante?.toLowerCase().includes(globalFilter.toLowerCase());

  const filtraFase = !faseFiltro || c.fase_actual === faseFiltro;
  const filtraSector = !sectorFiltro || c.sector === sectorFiltro;

  return filtraBusqueda && filtraFase && filtraSector;
});

  return (
    <>
    <div className="flex justify-between items-center mb-4">
  {/* Buscador */}
  <div className="flex items-center gap-2">
    <i className="pi pi-search text-gray-500" />
    <InputText
      value={globalFilter}
      onChange={(e) => {
        setGlobalFilter(e.target.value);
        setFilters({ global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } });
      }}
      placeholder="Buscar"
      className="p-inputtext-sm w-80 h-14 border border-gray-400 rounded-md px-4 py-2 bg-white shadow-sm 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 hover:shadow-lg transition-all duration-300 focus:bg-blue-50"
    />

    {/* Filtro FASES */}      
    <Dropdown
      value={faseFiltro}
      options={opcionesFase}
      onChange={(e) => setFaseFiltro(e.value)}
      optionLabel="label"
      optionValue="value"
      className="p-inputtext-sm center border border-gray-400 rounded-md px-4 py-2 bg-white shadow-sm 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 hover:shadow-lg transition-all duration-300 focus:bg-blue-50"
    />

    {/* Filtro SECTOR */}
    <Dropdown
      value={sectorFiltro}
      options={opcionesSector}
      onChange={e => setSectorFiltro(e.value)}
      optionLabel="label"
      optionValue="value"
      className="p-inputtext-sm center border border-gray-400 rounded-md px-4 py-2 bg-white shadow-sm 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 hover:shadow-lg transition-all duration-300 focus:bg-blue-50"
    />
  </div>

  {/* Botones */}
  <div className="flex gap-4">
    <Button 
      label="Añadir Convenio" 
      icon="pi pi-plus" 
      className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
      onClick={() => setShowDialogConvenio(true)}
    />
    <Button
  label="Editar Convenio"
  icon="pi pi-pencil"
  className="bg-[#CDA95F] hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform"
  onClick={() => {
    if (!selectedConvenioParaEditar) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "Seleccione un convenio para editar",
        life: 3000,
      });
      return;
    }
    setShowEditConvenioDialog(true);
  }}
/>

<Button
  label="Eliminar Convenio"
  icon="pi pi-trash"
  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
  onClick={() => {
    if (!selectedConvenioParaEditar) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "Seleccione un convenio para eliminar",
        life: 3000,
      });
      return;
    }
    setSelectedConvenioParaEliminar(selectedConvenioParaEditar); // Marcamos cuál se eliminará
    setShowConfirmDialog(true); // Mostramos modal de confirmación
  }}
/>
  </div>
</div>

<DataTable
  value={conveniosFiltrados}
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
  rowExpansionTemplate={rowExpansionTemplate}
  dataKey="id"
  paginator
  rows={5}
  className="custom-table"
  selection={selectedConvenioParaEditar}
  onSelectionChange={(e) => setSelectedConvenioParaEditar(e.value as Convenio | null)}
  selectionMode="single" // Selección por fila para editar
>
  {/* Columna para checkboxes de eliminación*/}
  {seleccionandoConvenio && (
    <Column
      selectionMode="single"
      headerStyle={{ width: "3rem" }}
      className="p-selection-column"
      bodyClassName="cursor-pointer"
      style={{ width: "3rem" }}
    />
  )}

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

{/* Dialog de confirmación al eliminar un registro */}
<Dialog
  visible={showConfirmDialogRegistro}
  onHide={() => setShowConfirmDialogRegistro(false)}
  header={
    <span style={{ color: "#172951", fontWeight: "bold", fontSize: "1.6rem" }}>
      Confirmar eliminación
    </span>
  }
  modal
  style={{ minWidth: 400 }}
  footer={
    <div className="flex justify-end gap-4">
      <Button
        label="Cancelar"
        icon="pi pi-times text-[#172951]"
        className="p-button-text"
        style={{ color: "#172951"}}
        onClick={() => setShowConfirmDialogRegistro(false)}
      />
      <Button
        label="Eliminar"
        icon="pi pi-check"
        className="p-button-danger p-2"
        style={{ backgroundColor: "#e53935", borderColor: "#e53935", color: "#fff" }}
        onClick={async () => {
          if (registroProcesoAEliminar) {
            await handleDeleteRegistro(registroProcesoAEliminar.id);
          }
          setShowConfirmDialogRegistro(false);
        }}
      />
    </div>
  }
>
  <div className="flex items-center gap-3 mt-2">
  <i className="pi pi-exclamation-triangle text-2xl text-yellow-500" />
  <span className="text-lg">
    ¿Seguro que deseas eliminar este <span className="font-semibold" style={{ color: "#172951" }}>registro de convenio</span>?
  </span>
</div>
</Dialog>

<Dialog
  visible={showConfirmDialog}
  onHide={() => setShowConfirmDialog(false)}
  header={
    <span style={{ color: "#172951", fontWeight: "bold", fontSize: "1.6rem" }}>
      Confirmar eliminación
    </span>
  }
  modal
  style={{ minWidth: 400 }}
  footer={
    <div className="flex justify-end gap-4">
      <Button
        label="Cancelar"
        icon="pi pi-times text-[#172951]"
        className="p-button-text"
        style={{ color: "#172951" }}
        onClick={() => setShowConfirmDialog(false)}
      />
      <Button
        label="Eliminar"
        icon="pi pi-check"
        className="p-button-danger p-2"
        style={{ backgroundColor: "#e53935", borderColor: "#e53935", color: "#fff" }}
        onClick={handleDeleteConvenio}
      />
    </div>
  }
>
  {selectedConvenioParaEliminar && (
    <div className="flex items-center gap-3 mt-2">
      <i className="pi pi-exclamation-triangle text-2xl text-yellow-500" />
      <span className="text-lg">
        ¿Seguro que deseas eliminar este <span className="font-semibold" style={{ color: "#172951" }}>convenio</span>?
        <div className="font-semibold text-red-600">{selectedConvenioParaEliminar.nombre}</div>
      </span>
    </div>
  )}
</Dialog>


<TimelineModal 
  visible={showTimeline} 
  onHide={() => setShowTimeline(false)} 
  registroProcesoId={selectedRegistroProceso ? Number(selectedRegistroProceso) : null}
/>
<ConvenioDialog 
visible={showDialogConvenio} 
onHide={() => setShowDialogConvenio(false)} 
onRefresh={fetchData} 
/>

<EditarRegistroDialog
  visible={showEditDialog}
  onHide={() => setShowEditDialog(false)}
  registro={registroSeleccionado}
  onSave={actualizarRegistroLocal}
/>

<EditarConvenioDialog
  visible={showEditConvenioDialog}
  onHide={() => setShowEditConvenioDialog(false)}
  convenio={selectedConvenioParaEditar}
  onRefresh={fetchData}
/>
    </>
  );
}
