"use client"; // Este archivo es un Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { SidebarProvider } from "./context/SidebarContext";
import { ProgressSpinner } from "primereact/progressspinner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (!auth) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // 📌 Mientras se verifica la sesión, mostrar un spinner de carga
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Barra lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
