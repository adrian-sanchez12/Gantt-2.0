import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET() {
  try {
    const data = await query("SELECT * FROM inventario");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener inventario" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      nombre_convenio,
      objeto_convenio,
      tipo_instrumento,
      presupuesto,
      instancias_tecnicas,
      informe,
      fecha_rige,
      fecha_vencimiento,
      cooperante,
      contraparte_externa
    } = data;

    if (!nombre_convenio || !fecha_rige || !fecha_vencimiento) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const sql = `
      INSERT INTO inventario 
      (nombre_convenio, objeto_convenio, tipo_instrumento, presupuesto, instancias_tecnicas, informe, fecha_rige, fecha_vencimiento, cooperante, contraparte_externa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nombre_convenio,
      objeto_convenio,
      tipo_instrumento,
      presupuesto,
      instancias_tecnicas,
      informe,
      fecha_rige,
      fecha_vencimiento,
      cooperante,
      contraparte_externa
    ];

    await query(sql, values);

    return NextResponse.json({ message: "Convenio creado correctamente" }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/inventario:", error);
    return NextResponse.json({ error: "Error al guardar el inventario" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el campo 'id'" }, { status: 400 });
    }

    const existe = await query("SELECT id FROM inventario WHERE id = ?", [id]);
    if (!Array.isArray(existe) || existe.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    const camposPermitidos = [
      "nombre_convenio", "objeto_convenio", "tipo_instrumento", "presupuesto",
      "instancias_tecnicas", "informe", "fecha_rige", "fecha_vencimiento", "documento_pdf"
    ];

    const updates = [];
    const values = [];

    for (const campo of camposPermitidos) {
      if (body[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        values.push(body[campo]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No se enviaron campos para actualizar" }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE inventario SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({ message: "Inventario actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/inventario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el parámetro 'id'" }, { status: 400 });
    }

    // Verifica que el registro exista
    const existe = await query("SELECT id FROM inventario WHERE id = ?", [id]);
    if (!Array.isArray(existe) || existe.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    // Eliminar el registro
    await query("DELETE FROM inventario WHERE id = ?", [id]);

    return NextResponse.json({ message: "Inventario eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/inventario:", error);
    return NextResponse.json({ error: "Error al eliminar el inventario" }, { status: 500 });
  }
}


