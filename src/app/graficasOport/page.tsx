"use client";
import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import GraficoViceministerio from "../components/Graficos/GraficoViceministerio";
import GraficoTemas from "../components/Graficos/GraficoTemas";
import GraficoSectores from "../components/Graficos/GraficoSectores";
import GraficoSocios from "../components/Graficos/GraficoSocios";
import GraficoPoblaciones from "../components/Graficos/GraficoPoblaciones";

export default function ReportesOportPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">

        <div className="custom-tabs">
          <TabView
            className="slanted-tabview"
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >

            <TabPanel header="🎓 Temas">
              <div className="p-4 fade-in" >
                <GraficoTemas />
              </div>
            </TabPanel>

            <TabPanel header="🏛️ Viceministros">
              <div className="p-4 fade-in">
                <GraficoViceministerio />
              </div>
            </TabPanel>

            <TabPanel header="🤝 Socios estratégicos">
              <div className="p-4 fade-in">
                <GraficoSocios />
              </div>
            </TabPanel>

            <TabPanel header="📝 Socios por sector">
              <div className="p-4 fade-in">
                <GraficoSectores />
              </div>
            </TabPanel>

            <TabPanel header="🌐 Poblaciones meta">
              <div className="p-4 fade-in">
                <GraficoPoblaciones />
              </div>
            </TabPanel>

          </TabView>
        </div>
      </div>
    </div>
  );
}