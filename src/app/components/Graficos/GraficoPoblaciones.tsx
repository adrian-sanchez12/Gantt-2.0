"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { Accordion, AccordionTab } from "primereact/accordion";
import { API_BASE } from "@/utils/api";
//Data Labels para las gráficas
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Oportunidad {
  poblacion_meta: string;
  fecha_inicio: string;
  nombre_oportunidad: string;
}

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

export default function GraficoPoblacion() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE}oportunidades/`);
        if (!response.ok) throw new Error("Error obteniendo oportunidades");
        const data = await response.json();
        setOportunidades(data);
      } catch (error) {
        console.error("Error cargando oportunidades:", error);
      }
    }
    fetchData();
  }, []);

  //Consigue el año de las fechas
  const aniosDisponibles = Array.from(
    new Set(
      oportunidades
        .map((o) => o.fecha_inicio?.slice(0, 4))
        .filter((a) => a !== undefined)
    )
  ).sort();

  //Filtra por año
  const oportunidadesFiltradas = anioSeleccionado
    ? oportunidades.filter((o) => o.fecha_inicio?.startsWith(anioSeleccionado))
    : oportunidades;

  const POBLACIONES_VALIDAS = [
    "Estudiantes",
    "Docentes",
    "Asesores",
    "Comunidad estudiantil",
    "Autoridades MEP",
    "Directores MEP"
  ]

  const agrupado: Record<string, Oportunidad[]> = {};
  oportunidadesFiltradas.forEach((o) => {
    const original = o.poblacion_meta?.trim() || "";

    const esMultiple = original.includes(",");
    const esValido = POBLACIONES_VALIDAS.includes(original);
    const categoriaAgrupada =
      !original
        ? "Sin población"
        : esMultiple || !esValido
          ? "Interdisciplinario"
          : original;

    if (!agrupado[categoriaAgrupada]) agrupado[categoriaAgrupada] = [];
    agrupado[categoriaAgrupada].push(o);
  });


  const labels = Object.keys(agrupado);
  const valores = labels.map((p) => agrupado[p].length);
  const colores = generarColoresDesdeBase(labels.length);

  const pieChartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: colores,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#333",
        formatter: (value: number, context: any) => {
          const sum = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1);
          return `${percentage}%`;
        },
        anchor: "end",
        align: "end",
        font: {
          weight: "bold" as const,
          size: 14,
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg flex">
      <div className="w-1/4 pr-4 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Poblaciones</h2>
        <ul className="space-y-2">
          {labels.map((poblacion, index) => (
            <li key={index} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: colores[index] }}
              ></span>
              <span className="text-gray-700 font-medium">{poblacion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 pl-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          📊 Distribución por población meta
        </h2>

        <div className="flex items-start gap-6 mb-6">
          <div className="w-[500px] h-[500px]">
            <Chart type="pie" data={pieChartData} options={chartOptions} />
          </div>

          <div className="pt-2">
            <Dropdown
              value={anioSeleccionado}
              options={aniosDisponibles.map((a) => ({ label: a, value: a }))}
              onChange={(e) => setAnioSeleccionado(e.value)}
              placeholder="Año"
              className="w-32 text-sm"
              showClear
            />
          </div>
        </div>

        <div className="w-full mt-4">
          <Accordion multiple activeIndex={[0]}>
            {labels.map((poblacion, idx) => (
              <AccordionTab
                key={idx}
                header={
                  <span
                    className="text-white px-3 py-1 rounded-md font-semibold"
                    style={{ backgroundColor: colores[idx] }}
                  >
                    {poblacion}
                  </span>
                }
              >
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {agrupado[poblacion].map((oportunidad, i) => (
                    <li key={i}>{oportunidad.nombre_oportunidad || "Nombre no disponible"}</li>
                  ))}
                </ul>
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
