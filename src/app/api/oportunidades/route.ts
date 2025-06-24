import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET() {
  try {
    const data = await query("SELECT * FROM oportunidades");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener oportunidades" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      nombre_oportunidad,
      objetivo,
      modalidad,
      tipo_oportunidad,
      socio,
      sector,
      tema,
      poblacion_meta,
      despacho,
      direccion_envio,
      fecha_inicio,
      fecha_fin,
      funcionario
    } = data;

    if (!nombre_oportunidad || !fecha_inicio || !socio || !objetivo) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const sql = `
      INSERT INTO oportunidades 
      (nombre_oportunidad, objetivo, modalidad, tipo_oportunidad, socio, sector, tema, poblacion_meta, despacho, direccion_envio, fecha_inicio, fecha_fin, funcionario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nombre_oportunidad,
      objetivo,
      modalidad,
      tipo_oportunidad,
      socio,
      sector,
      tema,
      poblacion_meta,
      despacho,
      direccion_envio,
      fecha_inicio,
      fecha_fin,
      funcionario
    ];

    await query(sql, values);

    return NextResponse.json({ message: "Oportunidad creada correctamente" }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/oportunidades:", error);
    return NextResponse.json({ error: "Error al guardar la oportunidad" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el campo 'id'" }, { status: 400 });
    }

    const existe = await query("SELECT id FROM oportunidades WHERE id = ?", [id]);
    if (!Array.isArray(existe) || existe.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    const camposPermitidos = [
      "nombre_oportunidad", "objetivo", "modalidad", "tipo_oportunidad",
      "socio", "sector", "tema", "poblacion_meta", "despacho", "direccion_envio", "fecha_inicio",
      "fecha_fin", "funcionario", "doc_pdf"
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
    const sql = `UPDATE oportunidades SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({ message: "Oportunidad actualizada correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/oportunidades:", error);
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
    const existe = await query("SELECT id FROM oportunidades WHERE id = ?", [id]);
    if (!Array.isArray(existe) || existe.length === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    // Eliminar el registro
    await query("DELETE FROM oportunidades WHERE id = ?", [id]);

    return NextResponse.json({ message: "Oportunidad eliminada correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/oportunidades:", error);
    return NextResponse.json({ error: "Error al eliminar la oportunidad" }, { status: 500 });
  }
}


