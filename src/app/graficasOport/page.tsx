"use client";
import { useState } from "react";
import GraficoViceministerio from "../components/Graficos/GraficoViceministerio";
import GraficoTemas from "../components/Graficos/GraficoTemas";
import GraficoSectores from "../components/Graficos/GraficoSectores";
import GraficoSocios from "../components/Graficos/GraficoSocios";
import GraficoPoblaciones from "../components/Graficos/GraficoPoblaciones";

export default function ReportesOportPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "🎓 Temas", component: <GraficoTemas /> },
    { label: "🏛️ Viceministerios", component: <GraficoViceministerio /> },
    { label: "🤝 Socios", component: <GraficoSocios /> },
    { label: "📝 Socios por sectores", component: <GraficoSectores /> },
    { label: "🌐  Poblaciones meta", component: <GraficoPoblaciones /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md border-r p-4">
        <div className="flex flex-col space-y-4">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-lg cursor-pointer transition duration-200 ${
                activeTab === index
                  ? "bg-[#CDA95F] text-white font-semibold shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>


      <div className="flex-1 p-6 bg-white shadow-inner overflow-auto">
        {tabs[activeTab].component}
      </div>
    </div>
  );
}