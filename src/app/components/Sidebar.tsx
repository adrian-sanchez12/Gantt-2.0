"use client";
import { useSidebar } from "../context/SidebarContext";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const { isSidebarVisible, setSidebarVisible } = useSidebar();
  const router = useRouter();

  return (
    <PrimeSidebar
      visible={isSidebarVisible}
      onHide={() => setSidebarVisible(false)}
      showCloseIcon={false} // 🔹 Quita el botón de cierre de arriba
      className="w-64 h-screen bg-white text-gray-900 border-r shadow-lg p-4 transition-transform duration-300"
    >
      {/* 📌 Imagen favicon centrada */}
      <div className="flex justify-center mb-4">
        <Image
          src="/favicon.png" 
          alt="Logo"
          width={50}  
          height={50}
          priority
        />
      </div>

      {/* 📌 Título del Sidebar */}
      <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Menú Principal</h2>

      <ul className="space-y-4">
        {/* Botón de Inicio */}
        <li>
          <Button
            label="Inicio"
            icon="pi pi-home"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/");
              setSidebarVisible(false);
            }}
          />
        </li>

        {/* Botón para Ingresar Convenio */}
        <li>
          <Button
            label="Ingresar Convenio"
            icon="pi pi-plus"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-green-500 hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/ingresarconvenio");
              setSidebarVisible(false);
            }}
          />
        </li>

        {/* Botón para Ver Convenios */}
        <li>
          <Button
            label="Ver Convenios"
            icon="pi pi-list"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-yellow-500 hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/convenios");
              setSidebarVisible(false);
            }}
          />
        </li>

        {/* Botón para Ver Estadísticas */}
        <li>
          <Button
            label="Ver Estadísticas"
            icon="pi pi-chart-bar"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-purple-500 hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/estadistica");
              setSidebarVisible(false);
            }}
          />
        </li>
      </ul>

      {/* 📌 Botón para Cerrar Sidebar (Solo queda este) */}
      <div className="absolute bottom-6 left-4 right-4">
        <Button
          label="Cerrar Menú"
          icon="pi pi-times"
          className="w-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-all duration-300 p-3 rounded-lg"
          onClick={() => setSidebarVisible(false)}
        />
      </div>
    </PrimeSidebar>
  );
}
