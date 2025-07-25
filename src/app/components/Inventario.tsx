"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog"
import EditarInventarioDialog from "./EditarInventarioDialog";
import AgregarInventarioDialog from "./AgregarInventarioDialog";


export default function InventarioTable() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState(""); 
  const toast = useRef<Toast>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState<InventarioItem | null>(null);

  

interface InventarioItem {
  id: number;
  cooperante: string;
  contraparte_externa: string;
  nombre_convenio: string;
  objeto_convenio: string;
  tipo_instrumento: string;
  presupuesto: number;
  instancias_tecnicas: string;
  informe: string;
  fecha_rige: string;
  fecha_vencimiento: string;
  documento_pdf: string;
}

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const response = await fetch("/api/inventario");
      const data: InventarioItem[] = await response.json();
      setInventario(data || []);
    } catch (error) {
      console.error("Error obteniendo inventario:", error);
    }
  };

// Función para calcular estado
  const calcularEstado = (fechaVto: string) => {
    if (!fechaVto) return "Sin fecha";
    const hoy = new Date();
    const vto = new Date(fechaVto);
    const diffMeses =
      (vto.getFullYear() - hoy.getFullYear()) * 12 +
      (vto.getMonth() - hoy.getMonth());

    if (diffMeses < 0) return "Vencido";
    if (diffMeses <= 6) return "Próximo a vencer";
    return "Vigente";
  };

  // Función para contar convenios próximos a vencer
  const proximosAVencer = inventario.filter(
    (item) => calcularEstado(item.fecha_vencimiento) === "Próximo a vencer"
  );

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
    {/* Banner Proactivo */}
    {proximosAVencer.length > 0 && showBanner && (
      <div className="bg-yellow-200 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-10 rounded flex justify-between items-center text-md">
        <span>
          ⚠ Tienes <strong>{proximosAVencer.length}</strong> convenios próximos a vencer. Plazo <strong>menor a 6 meses</strong>.
        </span>
        {/* Botones alineados */}
        <div className="flex items-center gap-2">
          {estadoFilter === "Próximo a vencer" ? (
            // Botón de Volver
            <Button
              label="Volver"
              className="p-button-sm bg-yellow-700 border-none text-white font-semibold py-2 px-3"
              onClick={() => setEstadoFilter("")}
            />
          ) : (
            // Botón de Ver ahora
            <Button
              label="Ver ahora"
              icon="pi pi-filter"
              className="p-button-sm bg-yellow-700 border-none text-white font-semibold py-2 px-3"
              onClick={() => setEstadoFilter("Próximo a vencer")}
            />
          )}

          {/* Botón de cerrar */}
          <button
            className="ml-2 text-yellow-900 hover:text-red-600 text-xl font-bold bg-transparent border-none cursor-pointer focus:outline-none"
            onClick={() => setShowBanner(false)}
            title="Ocultar alerta"
            style={{ lineHeight: '1', padding: 0 }}
          >
            ×
          </button>
        </div>
      </div>
    )}

      {/* Barra de búsqueda */}
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
          className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          onClick={() => setShowAddDialog(true)}
        />
      </div>

      <DataTable
        value={inventario.filter((item) =>
          estadoFilter ? calcularEstado(item.fecha_vencimiento) === estadoFilter : true
        )}
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

        {/* Columna Estado */}
        <Column
          header="Estado"
          body={(rowData) => {
            const estado = calcularEstado(rowData.fecha_vencimiento);
            const color =
              estado === "Vencido"
                ? "bg-red-500"
                : estado === "Próximo a vencer"
                ? "bg-yellow-500"
                : "bg-green-500";
            return (
              <span className={`inline-block min-w-[120px] text-center text-white px-3 py-1 rounded-full text-xs whitespace-nowrap ${color}`}>
                {estado}
              </span>
            );
          }}
        />
        {/* Columna PDF */}
        <Column
          field="documento_pdf"
          header="Documento PDF"
          headerStyle={{ textAlign: "center" }}
          bodyStyle={{ textAlign: "center", verticalAlign: "middle" }}
          body={(rowData) => (
            <div className="flex items-center justify-center gap-2">
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
              {/* Botón Editar */}
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning p-button-sm"
                onClick={() => abrirDialogEditar(rowData)}
              />
              {/* Botón Eliminar*/}
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => {
                  setRegistroAEliminar(rowData);
                  setShowConfirmDialog(true);
                  }}
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
        onClick={async () => {
          if (registroAEliminar) {
            await handleDeleteInventario(registroAEliminar.id);
          }
          setShowConfirmDialog(false);
        }}
      />
    </div>
  }
>
  <div className="flex items-center gap-3 mt-2">
    <i className="pi pi-exclamation-triangle text-2xl text-yellow-500" />
    <span className="text-lg">
      ¿Seguro que deseas eliminar este <span className="font-semibold" style={{ color: "#172951" }}>convenio del inventario</span>?
    </span>
  </div>
</Dialog>

    </div>
  );
}
