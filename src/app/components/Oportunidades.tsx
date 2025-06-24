"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import AgregarOportunidadDialog from "./AgregarOportunidadDialog";
import EditarOportunidadDialog from "./EditarOportunidadDialog";

export default function OportunidadesTable() {
  const [oportunidades, setOportunidades] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchOportunidades();
  }, []);

  const fetchOportunidades = async () => {
    try {
      const response = await fetch("/api/oportunidades");
      const data = await response.json();
      setOportunidades(data || []);
    } catch (error) {
      console.error("Error obteniendo oportunidades:", error);
    }
  };

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  //Manejo de PDF
  const handleFileUpload = async (event: any, rowData: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", rowData.id);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo subir el archivo", life: 3000 });
      return;
    }

    const { url } = await response.json();

    await fetch("/api/oportunidades", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowData.id, doc_pdf: url }),
    });

    toast.current?.show({ severity: "success", summary: "Éxito", detail: "Archivo subido correctamente", life: 3000 });
    fetchOportunidades();
  };
  //Manejo borrar pdf
  const handleDeletePDF = async (rowData: any) => {
    try {
      await fetch("/api/oportunidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowData.id, doc_pdf: "" }),
      });

      toast.current?.show({ severity: "info", summary: "Documento eliminado", detail: "El PDF ha sido eliminado", life: 3000 });
      fetchOportunidades();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el PDF", life: 3000 });
    }
  };

  const handleIconClick = (rowData: any) => {
    fileInputRefs.current[rowData.id]?.click();
  };
  //FIN MANEJO PDF


  //sirve para que se muestre un dialogo de confirmacion antes 
  //eliminar una oportunidad
  const confirmarEliminacion = (id: number) => {
    setSelectedId(id);
    setMostrarConfirmacion(true);
  };
  //si se decide eliminar
  const accept = async () => {
    if (selectedId === null) return;

    try {
      const response = await fetch(`/api/oportunidades?id=${selectedId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar la oportunidad");

      toast.current?.show({
        severity: "info",
        summary: "Eliminado",
        detail: "Registro eliminado correctamente",
        life: 3000,
      });
      fetchOportunidades();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el registro",
        life: 3000,
      });
    } finally {
      setSelectedId(null);
      setMostrarConfirmacion(false);
    }
  };
  //si no
  const reject = () => {
    toast.current?.show({
      severity: "warn",
      summary: "Cancelado",
      detail: "Eliminación cancelada",
      life: 3000,
    });
    setSelectedId(null);
    setMostrarConfirmacion(false);
  };

  const abrirDialogEditar = (rowData: any) => {
    setRegistroSeleccionado(rowData);
    setShowEditDialog(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const rowExpansionTemplate = (rowData: any) => {
    return (
      <div className="p-4 text-sm grid grid-cols-2 gap-4 bg-gray-50 rounded-lg border border-gray-200">

        <div className="col-span-2 text-center">
          <strong className="text-base block mb-1">Objetivo de la oportunidad:</strong>
          <p className="text-gray-700 text-sm italic pb-4">{rowData.objetivo}</p>
        </div>
        <div>
          <strong>Fecha de incio:</strong>
          <p>{formatDate(rowData.fecha_inicio)}</p>
        </div>
        <div>
          <strong>Fecha de finalización:</strong>
          <p>{formatDate(rowData.fecha_fin)}</p>
        </div>
        <div>
          <strong>Tema:</strong>
          <p>{rowData.tema}</p>
        </div>
        <div>
          <strong>Modalidad:</strong>
          <p>{rowData.modalidad}</p>
        </div>
        <div>
          <strong>Tipo:</strong>
          <p>{rowData.tipo_oportunidad}</p>
        </div>
        <div>
          <strong>Despacho:</strong>
          <p>{rowData.despacho}</p>
        </div>
        <div>
          <strong>Dirección(es) de envío:</strong>
          <p>{rowData.direccion_envio}</p>
        </div>
        <div>
          <strong>Funcionario que completó la ficha:</strong>
          <p>{rowData.funcionario}</p>
        </div>
        <div>
          <strong>Población meta:</strong>
          <p>{rowData.poblacion_meta}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={mostrarConfirmacion}
        onHide={() => setMostrarConfirmacion(false)}
        message="¿Está seguro de que desea eliminar esta oportunidad?"
        header="Confirmar eliminación"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
        acceptLabel="Sí"
        rejectLabel="No"
        acceptClassName="p-button-danger"
        rejectClassName="p-button-text"
        className="w-[90vw] md:w-[30rem]"
        footer={(  // 👇 Personalización para separar botones
          <div className="flex justify-end gap-3">
            <Button label="No" icon="pi pi-times" onClick={reject} className="p-button-text" />
            <Button label="Sí" icon="pi pi-check" onClick={accept} className="p-button-danger" />
          </div>
        )}
      />


      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 w-full max-w-md">
          <i className="pi pi-search text-gray-500" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="p-inputtext-sm w-full border border-gray-400 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2
                       focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        <Button
          label="Añadir Oportunidad"
          icon="pi pi-plus"
          className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all 
                      duration-300 transform hover:scale-105 text-sm"
          onClick={() => setShowAddDialog(true)}
        />
      </div>

      <DataTable
        value={oportunidades}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        paginator
        rows={10}
        filters={{ global: { value: globalFilter, matchMode: FilterMatchMode.CONTAINS } }}
        globalFilterFields={["nombre_oportunidad", "socio", "modalidad"]} //hablar sobre que partes
        className="text-sm border border-gray-200 rounded-lg shadow-sm"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="nombre_oportunidad" header="Nombre de la oportunidad" sortable />
        <Column field="socio" header="Socio estratégico" sortable />
        <Column field="sector" header="Sector" sortable />
        <Column field="fecha_inicio" header="Fecha de inicio" sortable
          body={(rowData) => {
            const fecha = new Date(rowData.fecha_inicio);
            return fecha.toLocaleDateString("es-CR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          }}
        />
        <Column
          field="doc_pdf"
          header="Invitación"
          body={(rowData) => (
            <div className="flex items-center gap-2">
              {rowData.doc_pdf ? (
                <>
                  <a
                    href={rowData.doc_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    📄 {rowData.doc_pdf?.split("/").pop() || "archivo.pdf"}
                  </a>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text text-red-500 hover:text-red-700"
                    onClick={() => handleDeletePDF(rowData)}
                    tooltip="Eliminar PDF"
                  />
                </>
              ) : (
                <>
                  <Button
                    icon="pi pi-upload"
                    className="p-button-text text-[#172951] hover:text-[#CDA95F] transition"
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
            </div>
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning p-button-sm"
                onClick={() => abrirDialogEditar(rowData)}
                tooltip="Editar"
              />
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => confirmarEliminacion(rowData.id)}
                tooltip="Eliminar"
              />

            </div>
          )}
          style={{ textAlign: "center", width: "110px" }}
        />
      </DataTable>

      <EditarOportunidadDialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        registro={registroSeleccionado}
        onSave={() => {
          toast.current?.show({
            severity: "success",
            summary: "Actualizado",
            detail: "El registro fue actualizado correctamente",
            life: 3000,
          });
          fetchOportunidades();
        }}
      />

      <AgregarOportunidadDialog
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        onSave={() => {
          toast.current?.show({
            severity: "success",
            summary: "Oportunidad agregado",
            detail: "La oportunidad fue agregada correctamente",
            life: 3000,
          });
          fetchOportunidades();
        }}
      />
    </div>
  );
}
