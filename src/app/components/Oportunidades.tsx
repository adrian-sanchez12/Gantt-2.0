"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import AgregarOportunidadDialog from "./AgregarOportunidadDialog";
import EditarOportunidadDialog from "./EditarOportunidadDialog";

export default function OportunidadesTable() {
  const [oportunidades, setOportunidades] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
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

  const handleDeleteOportunidad = async (id: number) => {
    try {
      const response = await fetch(`/api/oportunidades?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar la oportunidad");

      toast.current?.show({ severity: "info", summary: "Eliminado", detail: "Registro eliminado correctamente", life: 3000 });
      fetchOportunidades();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el registro", life: 3000 });
    }
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
          label="Añadir Oportunidad"
          icon="pi pi-plus"
          className="bg-[#172951] hover:bg-[#CDA95F] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
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
        <Column field="modalidad" header="Modalidad" sortable />
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
                onClick={() => handleDeleteOportunidad(rowData.id)}
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
