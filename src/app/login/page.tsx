"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const handleLogin = async (e: any) => {
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

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email")
      .eq("email", email)
      .single();

    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error de autenticación",
        detail: "Usuario no encontrado",
        life: 3000,
      });
      setLoading(false);
      return;
    }

    localStorage.setItem("isAuthenticated", "true");
    router.push("/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toast ref={toast} />

      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Iniciar Sesión
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Correo Electrónico</label>
            <InputText
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@mep.go.cr"
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            label={loading ? "Ingresando..." : "Ingresar"}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
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
  );
}
