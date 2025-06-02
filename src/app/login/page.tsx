"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import Image from "next/image";
import { Menu } from "primereact/menu";
import { API_BASE } from "@/utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const router = useRouter();
  const menuRef = useRef<Menu>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.endsWith("@mep.go.cr")) {
      toast.current?.show({
        severity: "warn",
        summary: "Correo no válido",
        detail: "Solo se permiten correos del dominio mep.go.cr",
        life: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        router.push("/dashboard");
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.error || "Credenciales incorrectas",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error de red",
        detail: "No se pudo conectar con el servidor",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header sin botón de menú */}
      <header className="flex justify-between items-center py-2 px-4 bg-[#172951] border-b shadow-md">
        <div className="flex items-center space-x-3">
          <Image
            src="/Logo_mep-DORADO.png"
            alt="Ministerio de Educación Pública"
            width={220}
            height={60}
            priority
          />
        </div>
      </header>

      {/* Formulario de Login */}
      <div className="flex justify-center items-start min-h-screen bg-[#f4f4f4] pt-24">
        <Toast ref={toast} />

        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#172951] mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-1">
                Correo Electrónico
              </label>
              <InputText
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@mep.go.cr"
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-1">
                Contraseña
              </label>
              <Password
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                feedback={false}
                toggleMask
                placeholder="********"
                inputClassName="w-full p-2 border border-gray-300 rounded-lg"
                className="w-full"
                required
              />
            </div>

            <Button
              type="submit"
              label={loading ? "Ingresando..." : "Ingresar"}
              className="w-full bg-[#172951] text-white py-2 rounded-lg hover:bg-[#CDA95F] transition-all duration-300 font-semibold"
              disabled={loading}
            />

            {loading && (
              <div className="flex justify-center mt-2">
                <ProgressSpinner />
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
