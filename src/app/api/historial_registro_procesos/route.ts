import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

// Obtener historial de un registro_proceso específico
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const registroProcesoId = searchParams.get("registro_proceso_id");

  if (!registroProcesoId) {
    return NextResponse.json({ error: "registro_proceso_id es requerido" }, { status: 400 });
  }

  try {
    const eventos = await query(`
      SELECT id, evento, fecha 
      FROM historial_registro_procesos 
      WHERE registro_proceso_id = ? 
      ORDER BY fecha ASC
    `, [registroProcesoId]);

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}

// Insertar un nuevo evento en el historial
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registro_proceso_id, evento, fecha } = body;

    if (!registro_proceso_id || !evento || !fecha) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    await query(`
      INSERT INTO historial_registro_procesos (registro_proceso_id, evento, fecha) 
      VALUES (?, ?, ?)
    `, [registro_proceso_id, evento, fecha]);

    return NextResponse.json({ message: "Evento agregado correctamente" }, { status: 201 });
  } catch (error) {
    console.error("Error insertando evento:", error);
    return NextResponse.json({ error: "Error al insertar evento" }, { status: 500 });
  }
}

// Eliminar un evento del historial
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
  }

  try {
    await query(`DELETE FROM historial_registro_procesos WHERE id = ?`, [id]);
    return NextResponse.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    return NextResponse.json({ error: "Error al eliminar evento" }, { status: 500 });
  }
}
