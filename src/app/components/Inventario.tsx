"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import EditarInventarioDialog from "./EditarInventarioDialog";
import AgregarInventarioDialog from "./AgregarInventarioDialog";

export default function InventarioTable() {
  const [inventario, setInventario] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const response = await fetch("/api/inventario");
      const data = await response.json();
      setInventario(data || []);
    } catch (error) {
      console.error("Error obteniendo inventario:", error);
    }
  };

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

    await fetch("/api/inventario", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowData.id, documento_pdf: url }),
    });

    toast.current?.show({ severity: "success", summary: "Éxito", detail: "Archivo subido correctamente", life: 3000 });
    fetchInventario();
  };

  const handleDeletePDF = async (rowData: any) => {
    try {
      await fetch("/api/inventario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowData.id, documento_pdf: "" }),
      });

      toast.current?.show({ severity: "info", summary: "Documento eliminado", detail: "El PDF ha sido eliminado", life: 3000 });
      fetchInventario();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el PDF", life: 3000 });
    }
  };

  const handleDeleteInventario = async (id: number) => {
    try {
      const response = await fetch(`/api/inventario?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar inventario");

      toast.current?.show({ severity: "info", summary: "Eliminado", detail: "Registro eliminado correctamente", life: 3000 });
      fetchInventario();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el registro", life: 3000 });
    }
  };

  const handleIconClick = (rowData: any) => {
    fileInputRefs.current[rowData.id]?.click();
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
        <div>
          <strong>Objeto del Convenio:</strong>
          <p className="text-gray-700">{rowData.objeto_convenio}</p>
        </div>
        <div>
          <strong>Fecha Rige:</strong>
          <p>{formatDate(rowData.fecha_rige)}</p>
        </div>
        <div>
          <strong>Fecha Vencimiento:</strong>
          <p>{formatDate(rowData.fecha_vencimiento)}</p>
        </div>
        <div>
          <strong>Tipo de Instrumento:</strong>
          <p>{rowData.tipo_instrumento}</p>
        </div>
        <div className="col-span-2">
          <strong>Instancias Técnicas:</strong>
          <p className="text-gray-700 whitespace-pre-wrap">{rowData.instancias_tecnicas}</p>
        </div>
        <div>
          <strong>Presupuesto:</strong>
          <p>₡ {Number(rowData.presupuesto).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="col-span-2">
          <strong>Informe:</strong>
          <p className="text-gray-700 whitespace-pre-wrap">{rowData.informe}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 w-full max-w-md">
          <i className="pi pi-search text-gray-500" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="p-inputtext-sm w-full border border-gray-400 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        <Button
          label="Añadir Convenio"
          icon="pi pi-plus"
          className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
          onClick={() => setShowAddDialog(true)}
        />
      </div>

      <DataTable
        value={inventario}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        paginator
        rows={10}
        filters={{ global: { value: globalFilter, matchMode: FilterMatchMode.CONTAINS } }}
        globalFilterFields={["cooperante", "contraparte_externa", "nombre_convenio"]}
        className="text-sm border border-gray-200 rounded-lg shadow-sm"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="cooperante" header="Cooperante" sortable />
        <Column field="contraparte_externa" header="Contraparte Externa" sortable />
        <Column field="nombre_convenio" header="Nombre del Convenio" sortable />
        <Column
          field="documento_pdf"
          header="Documento PDF"
          body={(rowData) => (
            <div className="flex items-center gap-2">
              {rowData.documento_pdf ? (
                <>
                  <a
                    href={rowData.documento_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    📄 {rowData.documento_pdf.split("/").pop()}
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
              />
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => handleDeleteInventario(rowData.id)}
              />
            </div>
          )}
          style={{ textAlign: "center", width: "110px" }}
        />
      </DataTable>

      <EditarInventarioDialog
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
          fetchInventario();
        }}
      />

      <AgregarInventarioDialog
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        onSave={() => {
          toast.current?.show({
            severity: "success",
            summary: "Convenio agregado",
            detail: "El convenio fue agregado correctamente",
            life: 3000,
          });
          fetchInventario();
        }}
      />
    </div>
  );
}
