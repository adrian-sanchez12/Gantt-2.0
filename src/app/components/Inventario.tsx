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
import { API_BASE, FILE_BASE } from "@/utils/api";

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
      const response = await fetch(`${API_BASE}inventario/`);
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

    const response = await fetch(`${API_BASE}upload/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo subir el archivo", life: 3000 });
      return;
    }

    const { url } = await response.json();

    await fetch(`${API_BASE}inventario/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowData.id, documento_pdf: url }),
    });

    toast.current?.show({ severity: "success", summary: "Archivo subido", detail: "PDF subido correctamente", life: 3000 });
    fetchInventario();
  };

  const handleDeletePDF = async (rowData: any) => {
    try {
      await fetch(`${API_BASE}inventario/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowData.id, documento_pdf: "" }),
      });

      toast.current?.show({ severity: "info", summary: "PDF eliminado", detail: "El documento fue eliminado", life: 3000 });
      fetchInventario();
    } catch (_error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el documento", life: 3000 });
    }
  };

  const handleDeleteInventario = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}inventario/?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar inventario");

      toast.current?.show({ severity: "info", summary: "Eliminado", detail: "Registro eliminado correctamente", life: 3000 });
      fetchInventario();
    } catch (_error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el registro", life: 3000 });
    }
  };

  const abrirDialogEditar = (rowData: any) => {
    setRegistroSeleccionado(rowData);
    setShowEditDialog(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const rowExpansionTemplate = (rowData: any) => (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800">
        <div>
          <p className="text-xs text-gray-500 mb-1">Tipo de Instrumento</p>
          <p className="font-medium">{rowData.tipo_instrumento}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
          <p className="font-medium">₡ {Number(rowData.presupuesto).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Fecha de Inicio</p>
          <p className="font-medium">{formatDate(rowData.fecha_rige)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Fecha de Vencimiento</p>
          <p className="font-medium">{formatDate(rowData.fecha_vencimiento)}</p>
        </div>
      </div>
  
      <div>
        <p className="text-xs text-gray-500 mb-1">Objeto del Convenio</p>
        <p className="text-gray-700 whitespace-pre-wrap">{rowData.objeto_convenio}</p>
      </div>
  
      <div>
        <p className="text-xs text-gray-500 mb-1">Instancias Técnicas</p>
        <p className="text-gray-700 whitespace-pre-wrap">{rowData.instancias_tecnicas}</p>
      </div>
  
      <div>
        <p className="text-xs text-gray-500 mb-1">Informe</p>
        <p className="text-gray-700 whitespace-pre-wrap">{rowData.informe}</p>
      </div>
    </div>
  );
  

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow">
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div className="relative w-full md:w-80">
  <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
  <InputText
    value={globalFilter}
    onChange={(e) => setGlobalFilter(e.target.value)}
    placeholder="Buscar..."
    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CDA95F] transition-all duration-200"
  />
</div>

        <Button
          label="Añadir"
          icon="pi pi-plus"
          className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold rounded-lg shadow-md px-4 py-2 transition"
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
        className="text-sm border border-gray-100 rounded-lg"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="cooperante" header="Cooperante" sortable />
        <Column field="contraparte_externa" header="Contraparte MEP" sortable />
        <Column field="nombre_convenio" header="Convenio" sortable />
        <Column
  field="documento_pdf"
  header="PDF"
  body={(rowData) => {
    const fileName = rowData.documento_pdf?.split("/").pop(); // Extrae el nombre del archivo

    return (
      <div className="flex items-center gap-2">
        {rowData.documento_pdf ? (
          <>
            <a
              href={`${FILE_BASE}${rowData.documento_pdf}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[150px]"
              title={fileName}
            >
              <i className="pi pi-file-pdf text-red-500" />
              <span className="truncate">{fileName}</span>
            </a>
            <Button
              icon="pi pi-trash"
              className="p-button-text text-red-500"
              onClick={() => handleDeletePDF(rowData)}
              title="Eliminar PDF"
            />
          </>
        ) : (
          <>
            <Button
              icon="pi pi-upload"
              className="p-button-text text-[#172951]"
              onClick={() => fileInputRefs.current[rowData.id]?.click()}
              title="Subir PDF"
            />
            <input
              type="file"
              accept="application/pdf"
              ref={(el) => {
                if (el) fileInputRefs.current[rowData.id] = el;
              }}
              onChange={(event) => handleFileUpload(event, rowData)}
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    );
  }}
/>
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-1 justify-center">
              <Button icon="pi pi-pencil" className="p-button-rounded p-button-sm p-button-text text-yellow-600" onClick={() => abrirDialogEditar(rowData)} />
              <Button icon="pi pi-trash" className="p-button-rounded p-button-sm p-button-text text-red-500" onClick={() => handleDeleteInventario(rowData.id)} />
            </div>
          )}
          style={{ width: "100px" }}
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
