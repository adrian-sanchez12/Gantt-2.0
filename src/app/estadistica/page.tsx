"use client";
import { TabView, TabPanel } from "primereact/tabview";
import Estadistica1 from "../components/Estadisticas1";
import Estadistica2 from "../components/Estadisticas2";
import Estadistica3 from "../components/Estadisticas3";
import Estadistica4 from "../components/Estadisticas4";
import { useState } from "react";

export default function EstadisticaPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* 📌 Título */}
       

        {/* 📌 TabView con Slanted Tabs */}
        <div className="custom-tabs">
          <TabView
            className="slanted-tabview"
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            <TabPanel header="📊 Resumen General">
              <div className="p-4 fade-in">
                <Estadistica1 />
              </div>
            </TabPanel>

            <TabPanel header="📈 Fases del macroproceso de convenios de cooperación ">
              <div className="p-4 fade-in">
                <Estadistica2 />
              </div>
            </TabPanel>

            <TabPanel header="📋 Diagrama Gantt ">
              <div className="p-4 fade-in">
                <Estadistica3 />
              </div>
            </TabPanel>

            <TabPanel header="📉 Convenios No Aprobados">
              <div className="p-4 fade-in">
                <Estadistica4 />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  );
}
