"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Accordion, AccordionTab } from "primereact/accordion";

// Diccionario para normalizar los nombres de sector
const nombresSectorLimpios: Record<string, string> = {
  "público": "Público",
  "privado": "Privado",
  "sociedad civil": "Sociedad Civil",
  "bilateral": "Bilateral",
  "academia": "Academia",
  "multilateral regional": "Multilateral Regional",
  "multilateral naciones unidas": "Multilateral Naciones Unidas",
  "otro": "Otro",
};

// Colores asignados a los sectores normalizados
const sectores = [
  { nombre: "Público", color: "#264a95" },
  { nombre: "Privado", color: "#4f6fb0" },
  { nombre: "Sociedad Civil", color: "#223155" },
  { nombre: "Bilateral", color: "#a7b1c3" },
  { nombre: "Academia", color: "#cfac65" },
  { nombre: "Multilateral Regional", color: "#a58e60" },
  { nombre: "Multilateral Naciones Unidas", color: "#e8d2ad" },
  { nombre: "Otro", color: "#d7cfbe" },
];

export default function EstadisticaPorSector() {
  const [conveniosPorSector, setConveniosPorSector] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/convenios");
        if (!response.ok) throw new Error("Error obteniendo convenios");

        const data = await response.json();
        const convenios = data.convenios || [];

        const agrupado: Record<string, string[]> = {};
        sectores.forEach(s => agrupado[s.nombre] = []);

        convenios.forEach((convenio: any) => {
          const sectorBruto = convenio.sector || "Otro";
          const clave = sectorBruto.trim().toLowerCase();
          const sector = nombresSectorLimpios[clave] || "Otro";

          if (!agrupado[sector]) agrupado[sector] = [];
          agrupado[sector].push(convenio.cooperante);
        });

        setConveniosPorSector(agrupado);
      } catch (error) {
        console.error("Error obteniendo convenios:", error);
      }
    }

    fetchData();
  }, []);

  // === DATOS PARA GRÁFICO DE BARRAS ===
  const barChartData = {
  labels: Object.keys(conveniosPorSector),
  datasets: [
    {
      label: "Cantidad de Convenios",
      data: Object.values(conveniosPorSector).map((items) => items.length),
      backgroundColor: sectores.map(s => s.color),
      borderRadius: 8,
      barThickness: 25,
    },
  ],
};


  const barChartOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    tooltip: {
    callbacks: {
    label: (context: any) => `${context.raw} convenios`,
  },
},

    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (val: number) => `${val}`,
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg flex">
      {/* Leyenda a la izquierda */}
      <div className="w-1/4 pr-4 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Sectores del Convenio</h2>
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

      {/* Gráfico de barras */}
      <div className="w-3/4 pl-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">📊 Distribución de Convenios por Sector</h2>
        <div className="w-full h-auto px-4">
          <Chart type="bar" data={barChartData} options={barChartOptions} />
        </div>

        <div className="mt-6 w-full">
          <Accordion multiple activeIndex={[0]}>
            {Object.entries(conveniosPorSector).map(([sector, convenios], index) => {
              const color = sectores.find(s => s.nombre === sector)?.color || "#D1D5DB";

              return convenios.length > 0 && (
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

