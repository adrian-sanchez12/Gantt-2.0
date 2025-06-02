"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SidebarProvider } from "../context/SidebarContext";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (!auth) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <ProgressSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
