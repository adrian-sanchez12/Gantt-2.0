"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";

const sectores = [
  { nombre: "Bilateral", color: "#CFAC65" },
  { nombre: "Multilateral", color: "#182951" },
  { nombre: "Academia", color: "#F2DAB1" },
  { nombre: "Público", color: "#C1C5C8" },
  { nombre: "Privado", color: "#0034A0" },
];

export default function SociosPorSector() {
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

  // Consigue los años de las fechas
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

  // Agrupa socios por sector
  const agrupado: Record<string, string[]> = {};
  sectores.forEach((s) => (agrupado[s.nombre] = []));

  oportunidadesFiltradas.forEach((oportunidad) => {
    const sector = oportunidad.sector?.trim();
    const socio = oportunidad.socio?.trim();
    if (sector && socio && agrupado[sector]) {
      if (!agrupado[sector].includes(socio)) {
        agrupado[sector].push(socio);
      }
    }
  });

  const sectoresConDatos = sectores.filter((s) => agrupado[s.nombre]?.length > 0);
  const labels = sectoresConDatos.map((s) => s.nombre);
  const valores = sectoresConDatos.map((s) => agrupado[s.nombre].length);


  const pieChartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: sectores.map((s) => s.color),
      },
    ],
  };

   const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: {
        top: 10,
        bottom: 20,
        left: 40,
        right: 50,
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
        <h2 className="text-lg font-bold mb-4 text-gray-700">Sectores</h2>
        <ul className="space-y-2">
          {sectores.map((sector, index) => (
            <li key={index} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: sector.color }}
              ></span>
              <span className="text-gray-700 font-medium">{sector.nombre}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 pl-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          📈 Socios por Sector
        </h2>

        <div className="flex items-start gap-6 mb-6">
          <div className="w-[500px] h-[500px]">
            <Chart type="pie" data={pieChartData} options={chartOptions} />
          </div>

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

        <div className="w-full">
          <Accordion multiple activeIndex={[0]}>
            {Object.entries(agrupado).map(([sector, socios], index) => {
              const color =
                sectores.find((s) => s.nombre === sector)?.color || "#D1D5DB";

              return socios.length > 0 && (
                <AccordionTab
                  key={index}
                  header={
                    <span
                      className="text-white px-3 py-1 rounded-md font-semibold"
                      style={{ backgroundColor: color }}
                    >
                      {sector}
                    </span>
                  }
                >
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {socios.map((socio, idx) => (
                      <li key={idx} className="py-1">{socio}</li>
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