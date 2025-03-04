"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";

export default function Estadistica3() {
  const [convenios, setConvenios] = useState<any[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("convenios")
        .select("id, cooperante, fecha_inicio, fecha_final, fase_actual");

      if (error) {
        console.error("Error obteniendo convenios:", error.message);
        return;
      }

      // Eliminar duplicados
      const uniqueConvenios = Array.from(new Map(data.map(item => [item.id, item])).values());
      setConvenios(uniqueConvenios);
    }

    if (convenios.length === 0) { // Evitar carga doble
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (convenios.length === 0 || !timelineRef.current) return;

    // Limpiar cualquier instancia previa del Timeline antes de inicializarlo
    if (timelineInstance.current) {
      timelineInstance.current.destroy();
    }

    const items = new DataSet(
      convenios.map((convenio) => ({
        id: convenio.id,
        content: `<strong>${convenio.cooperante}</strong>`,
        start: convenio.fecha_inicio,
        end: convenio.fecha_final,
        className: getPhaseColor(convenio.fase_actual),
      }))
    );

    timelineInstance.current = new Timeline(timelineRef.current, items, {
      stack: true,
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24 * 7, // Mínimo zoom de una semana
      zoomMax: 1000 * 60 * 60 * 24 * 365, // Máximo zoom de un año
      editable: false,
    });
  }, [convenios]);

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

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">📊 Diagrama Gantt - Progresión de Convenios</h1>

      <div ref={timelineRef} className="w-full h-96 border border-gray-300 rounded-lg"></div>

      {/* 📌 Leyenda de Fases */}
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
