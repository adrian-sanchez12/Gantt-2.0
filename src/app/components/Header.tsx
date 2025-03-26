"use client";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useSidebar } from "../context/SidebarContext";
import Image from "next/image";
import { Menu } from "primereact/menu";
import { useRef } from "react";

export default function Header() {
  const { setSidebarVisible } = useSidebar();
  const router = useRouter();
  const menuRef = useRef<Menu>(null);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); 
    router.push("/login"); 
  };

  return (
    <header className="flex justify-between items-center py-2 px-4 bg-[#172951] border-b">
      {/* Sección Izquierda: Botón de menú y Logo */}
      <div className="flex items-center space-x-2">
        <Button
          icon="pi pi-bars"
          className="p-button-text text-white text-xl"
          onClick={() => setSidebarVisible(true)}
        />
        
        {/* Logo MEP más grande y movido a la izquierda */}
        <Image 
          src="/Logo_mep-DORADO.png" 
          alt="Ministerio de Educación Pública"
          width={280}  
          height={70}
          priority
        />
      </div>

      {/* Sección Derecha: Icono de Usuario con Menú */}
      <div className="relative">
        <Button 
          icon="pi pi-user" 
          className="p-button-text text-white text-xl hover:text-blue-300 transition-all duration-300"
          onClick={(e) => menuRef.current?.toggle(e)}
        />
        <Menu 
          model={[
            { label: "Perfil", icon: "pi pi-user" },
            { separator: true },
            { label: "Cerrar Sesión", icon: "pi pi-sign-out", command: handleLogout },
          ]}
          popup 
          ref={menuRef} 
        />
      </div>
    </header>
  );
}
