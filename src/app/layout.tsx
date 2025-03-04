import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext"; // Importar AuthProvider
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { SidebarProvider } from "./context/SidebarContext";

// Importar estilos de PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gantt 2.0",
  description: "Sistema de gestión de convenios en trámite.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`flex bg-gray-100 ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* Ahora toda la app tiene acceso a la autenticación */}
          <SidebarProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
