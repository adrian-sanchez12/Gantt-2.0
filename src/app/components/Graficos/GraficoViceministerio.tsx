"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";
import { API_BASE } from "@/utils/api";

interface Oportunidad {
  despacho: string;
  fecha_inicio: string;
  nombre_oportunidad: string;
}

export default function GraficoViceministerio() {
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

  // Consigue el año de las fechas
  const aniosDisponibles = Array.from(
    new Set(
      oportunidades
        .map((o) => o.fecha_inicio?.slice(0, 4))
        .filter((a) => a !== undefined)
    )
  ).sort();

  const oportunidadesFiltradas = anioSeleccionado
    ? oportunidades.filter((o) => o.fecha_inicio?.startsWith(anioSeleccionado))
    : oportunidades;

  const DESPACHOS_VALIDOS = [
    "Ministro",
    "Académico",
    "Administrativo",
    "Planificación Institucional y Coordinación Regional",
  ];

  const agrupado: Record<string, Oportunidad[]> = {};

  oportunidadesFiltradas.forEach((o) => {
    const original = o.despacho?.trim() || "";

    const esMultiple = original.includes(",");
    const esValido = DESPACHOS_VALIDOS.includes(original);
    const despachoAgrupado =
      !original
        ? "Sin viceministerio"
        : esMultiple || !esValido
          ? "Interdisciplinario"
          : original;
    const nombre = o.nombre_oportunidad?.trim() || "(sin nombre)";
    if (!agrupado[despachoAgrupado]) agrupado[despachoAgrupado] = [];
    agrupado[despachoAgrupado].push(o);
  });


  const labels = Object.keys(agrupado);
  const valores = labels.map((p) => agrupado[p].length);

  const colores = [
    "#0034A0", "#F2DAB1", "#C1C5C8", "#CFAC65", "#182951", "#7B92B5"
  ];

  const pieChartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: colores.slice(0, labels.length),
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: {
        top: 40,
        bottom: 20,
        left: 50,
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
        <h2 className="text-lg font-bold mb-4 text-gray-700">Viceministerios</h2>
        <ul className="space-y-2">
          {labels.map((despacho, index) => (
            <li key={index} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: colores[index] }}
              ></span>
              <span className="text-gray-700 font-medium">{despacho}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 pl-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          📊 Distribución por viceministerios
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
            {labels.map((viceministerio, idx) => (
              <AccordionTab
                key={idx}
                header={
                  <span
                    className="text-white px-3 py-1 rounded-md font-semibold"
                    style={{ backgroundColor: colores[idx] }}
                  >
                    {viceministerio}
                  </span>
                }
              >
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {agrupado[viceministerio].map((oportunidad, i) => (
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
