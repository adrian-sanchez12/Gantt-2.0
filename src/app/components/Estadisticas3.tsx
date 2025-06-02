"use client";

import { useEffect, useState, useRef } from "react";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import { API_BASE } from "@/utils/api";

export default function Estadistica3() {
  const [convenios, setConvenios] = useState<any[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE}convenios`);
        const data = await response.json();

        if (data.error) {
          console.error("Error obteniendo convenios:", data.error);
          return;
        }

        // Convertir fechas correctamente
        const uniqueConvenios = data.convenios
          .map((item: any) => ({
            ...item,
            fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio) : null,
            fecha_final: item.fecha_final ? new Date(item.fecha_final) : null,
          }))
          .filter((item: any) => item.fecha_inicio && item.fecha_final); // Filtrar fechas inválidas

        setConvenios(uniqueConvenios);
      } catch (error) {
        console.error("Error obteniendo convenios:", error);
      }
    }

    fetchData();
  }, []);

  function getPhaseColor(fase: string) {
    const faseColors: Record<string, string> = {
      "Negociación": "bg-blue-400",
      "Visto Bueno": "bg-green-400",
      "Revisión Técnica": "bg-yellow-400",
      "Análisis Legal": "bg-orange-400",
      "Verificación Legal": "bg-red-400",
      "Firma": "bg-purple-400",
    };
    return faseColors[fase] || "bg-gray-400"; // Color gris si no hay fase
  }

  useEffect(() => {
    if (!timelineRef.current || convenios.length === 0) return;

    // 🛑 Eliminar instancia previa de Timeline si existe
    if (timelineInstance.current) {
      timelineInstance.current.destroy();
    }

    // Crear una nueva instancia de Timeline solo si hay datos válidos
    const items = new DataSet(
      convenios.map((convenio) => ({
        id: convenio.id,
        content: `<strong>${convenio.cooperante}</strong>`,
        start: convenio.fecha_inicio?.toISOString(), // Convertir a formato ISO
        end: convenio.fecha_final?.toISOString(), // Convertir a formato ISO
        className: getPhaseColor(convenio.fase_actual),
      }))
    );

    timelineInstance.current = new Timeline(timelineRef.current, items, {
      stack: true,
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24 * 7, 
      zoomMax: 1000 * 60 * 60 * 24 * 365, 
      editable: false,
    });
  }, [convenios]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">📊 Diagrama Gantt - Progresión de Convenios</h1>

      {/*  Asegurar que el contenedor del Timeline tenga tamaño definido */}
      <div ref={timelineRef} className="w-full h-[500px] border border-gray-300 rounded-lg"></div>

      {/*  Leyenda de Fases */}
      <div className="mt-6 flex flex-wrap gap-4">
        {Object.entries({
          "Negociación": "bg-blue-400",
          "Visto Bueno": "bg-green-400",
          "Revisión Técnica": "bg-yellow-400",
          "Análisis Legal": "bg-orange-400",
          "Verificación Legal": "bg-red-400",
          "Firma": "bg-purple-400",
        }).map(([fase, color], index) => (
          <div key={index} className="flex items-center">
            <span className={`w-4 h-4 inline-block mr-2 ${color}`}></span>
            <span className="text-gray-700 font-medium">{fase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
