"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Chart } from "primereact/chart";
import { Accordion, AccordionTab } from "primereact/accordion";


const fases = [
  { nombre: "Negociación", color: "#3B82F6" }, // Azul
  { nombre: "Visto Bueno", color: "#10B981" }, // Verde
  { nombre: "Revisión Técnica", color: "#FACC15" }, // Amarillo
  { nombre: "Análisis Legal", color: "#F97316" }, // Naranja
  { nombre: "Verificación Legal", color: "#EF4444" }, // Rojo
  { nombre: "Firma", color: "#8B5CF6" }, // Morado
];

export default function Estadistica2() {
  const [conveniosPorFase, setConveniosPorFase] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("convenios").select("id, cooperante, fase_actual");

      if (error) {
        console.error("Error obteniendo convenios:", error.message);
        return;
      }

      // Agrupar convenios por fase
      const agrupado: Record<string, string[]> = {};
      fases.forEach(f => agrupado[f.nombre] = []); // Inicializar con todas las fases

      data.forEach(convenio => {
        if (agrupado[convenio.fase_actual]) {
          agrupado[convenio.fase_actual].push(convenio.cooperante);
        }
      });

      setConveniosPorFase(agrupado);
    }

    fetchData();
  }, []);

  // Preparar datos para el PieChart
  const pieChartData = {
    labels: Object.keys(conveniosPorFase),
    datasets: [
      {
        data: Object.values(conveniosPorFase).map(convenios => convenios.length),
        backgroundColor: fases.map(f => f.color),
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, // Permite modificar el tamaño
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12, // Ajustar tamaño del texto de la leyenda
          },
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg flex">
      {/* 📌 Leyenda de Fases a la Izquierda */}
      <div className="w-1/4 pr-4 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Fases del Convenio</h2>
        <ul className="space-y-2">
          {fases.map((fase, index) => (
            <li key={index} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: fase.color }}
              ></span>
              <span className="text-gray-700 font-medium">{fase.nombre}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 📊 Gráfico de Convenios por Fase */}
      <div className="w-3/4 pl-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">📊 Distribución de Convenios por Fase</h2>
        <div className="w-[400px] h-[400px]"> {/* Reducir tamaño del gráfico */}
          <Chart type="pie" data={pieChartData}  />
        </div>

        <div className="mt-6 w-full">
  <Accordion multiple activeIndex={[0]}>
    {Object.entries(conveniosPorFase).map(([fase, convenios], index) => {
      const faseColor = fases.find(f => f.nombre === fase)?.color || "#D1D5DB"; // Color por defecto

      return convenios.length > 0 && (
        <AccordionTab
          key={index}
          header={
            <span
              className="text-white px-3 py-1 rounded-md font-semibold"
              style={{ backgroundColor: faseColor }}
            >
              {fase}
            </span>
          }
        >
          <ul className="list-disc list-inside text-gray-600 text-sm">
            {convenios.map((nombre, idx) => (
              <li key={idx} className="py-1">{nombre}</li>
            ))}
          </ul>
        </AccordionTab>
      );
    })}
  </Accordion>
</div>

      </div>
    </div>
  );
}
