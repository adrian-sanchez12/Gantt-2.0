"use client";
import { useEffect, useState } from "react";

export default function EstadisticasInventario() {
  const [inventario, setInventario] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/inventario")
      .then(res => res.json())
      .then(setInventario);
  }, []);

  const calcularEstado = (fechaVto: string) => {
    if (!fechaVto) return "Sin fecha";
    const hoy = new Date();
    const vto = new Date(fechaVto);
    const diffMeses =
      (vto.getFullYear() - hoy.getFullYear()) * 12 +
      (vto.getMonth() - hoy.getMonth());
    if (diffMeses < 0) return "Vencido";
    if (diffMeses <= 6) return "Próximo a vencer";
    return "Vigente";
  };

  const totalVigentes = inventario.filter(item => calcularEstado(item.fecha_vencimiento) === "Vigente").length;
  const totalProximos = inventario.filter(item => calcularEstado(item.fecha_vencimiento) === "Próximo a vencer").length;
  const totalVencidos = inventario.filter(item => calcularEstado(item.fecha_vencimiento) === "Vencido").length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded-lg flex flex-col items-center">
        <span className="text-green-800 font-semibold">Vigentes</span>
        <span className="text-2xl">{totalVigentes}</span>
      </div>
      <div className="bg-yellow-100 p-4 rounded-lg flex flex-col items-center">
        <span className="text-yellow-800 font-semibold">Próximo a vencer</span>
        <span className="text-2xl">{totalProximos}</span>
      </div>
      <div className="bg-red-100 p-4 rounded-lg flex flex-col items-center">
        <span className="text-red-800 font-semibold">Vencidos</span>
        <span className="text-2xl">{totalVencidos}</span>
      </div>
    </div>
  );
}
