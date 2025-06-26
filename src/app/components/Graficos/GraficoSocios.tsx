"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

//Las dos funciones sirven para que los colores de las barras sigan
//la paleta de colores del MEP aunque se creen x cantidad
function generarColoresDesdeBase(cantidad: number): string[] {
  const baseColors = ["#CFAC65", "#182951", "#F2DAB1", "#C1C5C8", "#0034A0"];
  const colores: string[] = [];

  for (let i = 0; i < cantidad; i++) {
    const baseIndex = i % baseColors.length;
    const nextIndex = (baseIndex + 1) % baseColors.length;

    const ratio = (i / cantidad) % 1;

    const color = mezclarColoresHex(baseColors[baseIndex], baseColors[nextIndex], ratio);
    colores.push(color);
  }

  return colores;
}
function mezclarColoresHex(hex1: string, hex2: string, ratio: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);

  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default function OportunidadesPorSocio() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/oportunidades");
        if (!response.ok) throw new Error("Error obteniendo oportunidades");

        const data = await response.json();
        setOportunidades(data);
      } catch (error) {
        console.error("Error obteniendo oportunidades:", error);
      }
    }

    fetchData();
  }, []);

  // Saca los años de las fechas
  const añosDisponibles = Array.from(
    new Set(
      oportunidades
        .map((o) => o.fecha_inicio?.slice(0, 4))
        .filter((a) => a !== undefined)
    )
  ).sort();

  const oportunidadesFiltradas = anioSeleccionado
    ? oportunidades.filter((o) => o.fecha_inicio?.startsWith(anioSeleccionado))
    : oportunidades;

  const agrupado: Record<string, string[]> = {};
  oportunidadesFiltradas.forEach((o) => {
    const socio = o.socio?.trim() || "Sin socio";
    const nombre = o.nombre_oportunidad?.trim() || "(sin nombre)";
    if (!agrupado[socio]) agrupado[socio] = [];
    agrupado[socio].push(nombre);
  });

  const labels = Object.keys(agrupado);
  const valores = Object.values(agrupado).map((o) => o.length);
  const colores = generarColoresDesdeBase(labels.length);

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Oportunidades por Socio",
        backgroundColor: colores,
        data: valores,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        ticks: {
          precision: 0,
          color: "#6B7280",
        },
      },
      y: {
        ticks: {
          color: "#6B7280",
          font: {
            size: 10,
          },
          callback: function (value: any) {
            const label = labels[value];
            return label && label.length > 50 ? label.slice(0, 50) + "..." : label;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#fff",
        formatter: (value: number, context: any) => {
          const sum = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1);
          return `${percentage}%`;
        },
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 12,
        },
        clamp: true,
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📊 Distribución por socio</h2>
        <div className="pt-2">
          <Dropdown
            value={anioSeleccionado}
            options={añosDisponibles.map((a) => ({ label: a, value: a }))}
            onChange={(e) => setAnioSeleccionado(e.value)}
            placeholder="Año"
            className="w-32 text-sm"
            showClear
          />
        </div>
      </div>

      <div className="w-full mb-6" style={{ height: '900px', overflow: "scroll" }}>
        <Chart type="bar" data={barChartData} options={chartOptions} />
      </div>

      <div className="w-full">
        <Accordion multiple activeIndex={[0]}>
          {Object.entries(agrupado).map(([socio, lista], index) => (
            <AccordionTab
              key={index}
              header={<span className="text-gray-800 font-medium">{socio}</span>}
            >
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {lista.map((nombre, idx) => (
                  <li key={idx} className="py-1">{nombre}</li>
                ))}
              </ul>
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
