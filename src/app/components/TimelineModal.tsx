import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FaCheckCircle, FaExclamationCircle, FaHourglassHalf, FaFileAlt, FaTrash } from "react-icons/fa"; 

interface TimelineModalProps {
  visible: boolean;
  onHide: () => void;
  registroProcesoId: number | null;
}

export default function TimelineModal({
  visible,
  onHide,
  registroProcesoId,
}: TimelineModalProps) {
  const [eventos, setEventos] = useState<{ id: number; evento: string; fecha: string }[]>([]);
  const [newEvento, setNewEvento] = useState<{ evento: string; fecha: Date | null }>({
    evento: "",
    fecha: null, 
  });
    const [loading, setLoading] = useState(false);
  const toast = useRef<Toast | null>(null); 

  useEffect(() => {
    const fetchEventos = async () => {
      if (!registroProcesoId) {
        console.warn(" No hay registroProcesoId, consulta cancelada.");
        return;
      }

      try {
        const response = await fetch(`/api/historial_registro_procesos?registro_proceso_id=${registroProcesoId}`);
        if (!response.ok) throw new Error("Error obteniendo eventos");

        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error(" Error obteniendo eventos:", (error as Error).message);
      }
    };

    if (visible && registroProcesoId) {
      fetchEventos();
    }
  }, [registroProcesoId, visible]);

  const formatDateForMariaDB = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const handleAddEvento = async () => {
    if (!newEvento.evento.trim() || !newEvento.fecha) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos Requeridos",
        detail: "Por favor, ingrese un evento y seleccione una fecha.",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/historial_registro_procesos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registro_proceso_id: registroProcesoId,
          evento: newEvento.evento,
          fecha: formatDateForMariaDB(newEvento.fecha as Date),
        }),
      });

      if (!response.ok) throw new Error("Error al agregar el evento");

      const newEvent = await response.json();
      toast.current?.show({
        severity: "success",
        summary: "Evento Agregado",
        detail: "El evento fue agregado correctamente.",
        life: 2000,
      });

      setEventos([...eventos, { id: newEvent.id, evento: newEvento.evento, fecha: formatDateForMariaDB(newEvento.fecha as Date) ?? "" }]);
      setNewEvento({ evento: "", fecha: null });
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (error as Error).message, life: 3000 });
    }

    setLoading(false);
  };

  const getEventStyle = (evento: string) => {
    const estilos = {
      default: { color: "bg-gray-500", icon: <FaFileAlt className="text-white" /> },
      aprobado: { color: "bg-green-500", icon: <FaCheckCircle className="text-white" /> },
      rechazado: { color: "bg-red-500", icon: <FaExclamationCircle className="text-white" /> },
      documento: { color: "bg-yellow-500", icon: <FaHourglassHalf className="text-white" /> },
    };

    if (evento.toLowerCase().includes("aprobación")) return estilos.aprobado;
    if (evento.toLowerCase().includes("rechazo") || evento.toLowerCase().includes("finalización")) return estilos.rechazado;
    if (evento.toLowerCase().includes("documento")) return estilos.documento;
    return estilos.default;
  };

  const handleDeleteEvento = async (id: number) => {
    try {
      const response = await fetch(`/api/historial_registro_procesos?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el evento");

      toast.current?.show({
        severity: "success",
        summary: "Evento Eliminado",
        detail: "El evento fue eliminado correctamente.",
        life: 2000,
      });

      setEventos(eventos.filter((evento) => evento.id !== id));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (error as Error).message, life: 3000 });
    }
  };

  const confirmDelete = (id: number) => {
    confirmDialog({
      message: "¿Estás seguro de que quieres eliminar este evento?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteEvento(id),
    });
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Historial del Proceso" style={{ width: "40vw" }}>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-4 space-y-4">
        <div className="relative border-l-4 border-gray-300 pl-4">
          {eventos.length === 0 ? (
            <p className="text-gray-500">No hay eventos registrados.</p>
          ) : (
            eventos.map((evento) => {
              const { color, icon } = getEventStyle(evento.evento);
              return (
                <div key={evento.id} className="relative mb-6 pl-6">
                  <div className={`absolute left-[-1.25rem] top-2 w-8 h-8 flex items-center justify-center rounded-full shadow-md ${color}`}>
                    {icon}
                  </div>
                  <div className="p-3 bg-white border rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <strong className="text-gray-800">{evento.evento}</strong>
                      <p className="text-sm text-gray-600">{new Date(evento.fecha).toLocaleString()}</p>
                    </div>
                    <Button icon={<FaTrash />} className="p-button-text p-button-danger" onClick={() => confirmDelete(evento.id)} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700">Añadir Nuevo Evento</h3>
          <div className="grid grid-cols-1 gap-4">
            <InputText value={newEvento.evento} onChange={(e) => setNewEvento({ ...newEvento, evento: e.target.value })} placeholder="Ej: Documentos enviados, aprobación final..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <Calendar
  value={newEvento.fecha}
  onChange={(e) =>
    setNewEvento({ ...newEvento, fecha: e.value as Date | null }) 
  }
  showIcon
  className="w-full border border-gray-300 rounded-md px-3 py-2"
/>            <Button label="Guardar" icon="pi pi-check" onClick={handleAddEvento} className="p-button-success px-4 py-2" loading={loading} />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
