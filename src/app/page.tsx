"use client";

import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { FaBook, FaFileAlt, FaClipboardList, FaCalendarAlt, FaHandshake } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 

export default function Home() {
  const [totalConvenios, setTotalConvenios] = useState(0);
  const [totalCooperantes, setTotalCooperantes] = useState(0);

  useEffect(() => {
    async function fetchData() {
      // Obtener el total de convenios firmados
      const { data: convenios, error: conveniosError } = await supabase
        .from("convenios")
        .select("*");

      if (!conveniosError) {
        setTotalConvenios(convenios.length);
      }

      // Obtener el total de cooperantes
      const { data: cooperantes, error: cooperantesError } = await supabase
        .from("convenios")
        .select("cooperante");

      if (!cooperantesError) {
        const uniqueCooperantes = new Set(cooperantes.map((item) => item.cooperante));
        setTotalCooperantes(uniqueCooperantes.size);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 📌 Columna Izquierda (Bienvenida + Fases) */}
        <div className="md:col-span-2 space-y-6">
          {/* Sección de Bienvenida */}
          <motion.section
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500"
            whileHover={{ scale: 1.02 }}
          >
            <h1 className="text-3xl font-bold text-blue-700 mb-4 flex items-center">
              <FaClipboardList className="mr-3 text-blue-500" /> Bienvenido a Gantt 2.0
            </h1>
            <p className="text-gray-700">
              Gantt 2.0 es una herramienta de gestión de convenios de cooperación que permite realizar un seguimiento estructurado
              de los procesos desde la negociación inicial hasta la firma y custodia del convenio.
            </p>
          </motion.section>

          {/* Sección de Fases del Macroproceso */}
          <motion.section
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaFileAlt className="mr-3 text-green-500" /> GANTT 2025 - Fases del Macroproceso de Convenios
            </h2>
            <Accordion>
              <AccordionTab header="FASE 1. Negociación y gestiones iniciales">
                <ul className="list-disc pl-5">
                  <li>1.1 Presentación de la carta de manifestación de interés</li>
                  <li>1.2 Redacción de la propuesta de convenio</li>
                  <li>1.3 Entrega de documentación legal</li>
                </ul>
              </AccordionTab>
              <AccordionTab header="FASE 2. Visto bueno del viceministerio">
                <ul className="list-disc pl-5">
                  <li>2.1 Solicitud por parte de la Dirección de Asuntos Internacionales y Cooperación</li>
                  <li>2.2 Envío de la comunicación de visto bueno</li>
                </ul>
              </AccordionTab>
              <AccordionTab header="FASE 3. Revisiones técnicas y criterios de viabilidad">
                <ul className="list-disc pl-5">
                  <li>3.1 Solicitud de revisión técnica</li>
                  <li>3.2 Envío del criterio técnico</li>
                </ul>
              </AccordionTab>
              <AccordionTab header="FASE 4. Análisis legal">
                <ul className="list-disc pl-5">
                  <li>4.1 Revisión de la propuesta</li>
                  <li>4.2 Solicitud de aclaraciones</li>
                </ul>
              </AccordionTab>
              <AccordionTab header="FASE 5. Verificación de legalidad">
                <p>Responsable: Dirección de Asuntos Jurídicos</p>
              </AccordionTab>
              <AccordionTab header="FASE 6. Firma y custodia de ejemplares originales">
                <ul className="list-disc pl-5">
                  <li>6.1 Firma de la autoridad ministerial MEP</li>
                  <li>6.2 Firma del cooperante</li>
                  <li>6.3 Envío a la DAJ del archivo digital</li>
                </ul>
              </AccordionTab>
            </Accordion>
          </motion.section>
        </div>

        {/* 📌 Columna Derecha (Documentación) */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-yellow-500"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaBook className="mr-3 text-yellow-500" /> Documentación
          </h2>
          <p className="text-gray-700">
            Encuentra aquí la documentación detallada sobre cómo usar Gantt 2.0 y gestionar tus convenios de manera eficiente.
          </p>
          <Link href="/Documentacion_Gantt_2.pdf" download>
            <Button
              label="Ir a la Documentación"
              icon="pi pi-download"
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            />
          </Link>
        </motion.div>
      </motion.div>

      {/* 📊 Sección de Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Tarjeta de convenios firmados */}
        <motion.div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center border border-gray-300">
          <h3 className="text-gray-700 text-lg font-semibold mb-2">Total de Convenios Firmados</h3>
          <span className="text-4xl font-bold text-blue-600">{totalConvenios}</span>
          <FaCalendarAlt className="text-blue-500 text-5xl mt-3" />
          <p className="text-gray-500 mt-2">Bitácora de convenios en trámite (Gantt)</p>
        </motion.div>

        {/* Tarjeta de cooperantes */}
        <motion.div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center border border-gray-300">
          <h3 className="text-gray-700 text-lg font-semibold mb-2">Total de Cooperantes</h3>
          <span className="text-4xl font-bold text-green-600">{totalCooperantes}</span>
          <FaHandshake className="text-green-500 text-5xl mt-3" />
          <p className="text-gray-500 mt-2">Fichas de Cooperantes</p>
        </motion.div>
      </div>
    </main>
  );
}
