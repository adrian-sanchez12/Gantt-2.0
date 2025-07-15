"use client";
import { TabView, TabPanel } from "primereact/tabview";
import Estadistica2 from "../components/Estadisticas2";
import EstadisticaPorSector from "../components/EstadisticaPorSector";
import Estadistica3 from "../components/Estadisticas3";
import { useState } from "react";

export default function EstadisticaPage() {
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

            <TabPanel header="📈 Por Fase de Macroproceso">
              <div className="p-4 fade-in">
                <Estadistica2 />
              </div>
            </TabPanel>

            <TabPanel header="📊 Por Sector">
              <div className="p-4 fade-in">
                <EstadisticaPorSector />
              </div>
            </TabPanel>

            {/* <TabPanel header="📋 Diagrama Gantt ">
              <div className="p-4 fade-in">
                <Estadistica3 />
              </div>
            </TabPanel> */}

          </TabView>
        </div>
      </div>
    </div>
  );
}
