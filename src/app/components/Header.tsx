"use client";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
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
    localStorage.removeItem("isAuthenticated"); // Eliminar sesión
    router.push("/login"); // Redirigir al login
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      {/* Sección Izquierda: Botón de menú y Logo */}
      <div className="flex items-center space-x-4">
        <Button
          icon="pi pi-bars"
          className="p-button-text"
          onClick={() => setSidebarVisible(true)}
        />
        
        {/* Logo MEP */}
        <Image 
          src="/logo_mep.png" 
          alt="Ministerio de Educación Pública"
          width={210}  
          height={50}
          priority
        />
      </div>

      {/* Sección Derecha: Barra de Búsqueda y Usuario */}
      <div className="flex items-center space-x-4">
        <i className="pi pi-search" />
        <span className="p-input-icon-left">
          <InputText placeholder="Search..." className="p-inputtext-sm" />
        </span>

        {/* Icono de Usuario con Menú */}
        <div className="relative">
          <Button 
            icon="pi pi-user" 
            className="p-button-text hover:text-blue-600 transition-all duration-300"
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
      </div>
    </header>
  );
}
