import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

// ✅ Función para formatear fecha para MariaDB
const formatDateForMariaDB = (date: string | Date | null) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

// 📌 Obtener registros de procesos
export async function GET(req: Request) {
  try {
    const registros = await query("SELECT * FROM registro_procesos ORDER BY fecha_inicio DESC");
    return NextResponse.json(registros);
  } catch (error) {
    console.error("Error obteniendo registros:", error);
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}

// 📌 Insertar un nuevo registro y actualizar fase_actual del convenio
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      convenio_id,
      entidad_proponente,
      autoridad_ministerial,
      funcionario_emisor,
      entidad_emisora,
      funcionario_receptor,
      entidad_receptora,
      registro_proceso,
      fecha_inicio,
      fecha_final,
      tipo_convenio,
      fase_registro,
      doc_pdf
    } = body;

    // Insertar en registro_procesos
    await query(
      `INSERT INTO registro_procesos 
      (convenio_id, 
      entidad_proponente, 
      autoridad_ministerial, 
      funcionario_emisor, 
      entidad_emisora, 
      funcionario_receptor, 
      entidad_receptora, 
      registro_proceso, 
      fecha_inicio, 
      fecha_final, 
      tipo_convenio, 
      fase_registro,
      doc_pdf) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        convenio_id,
        entidad_proponente || null,
        autoridad_ministerial || null,
        funcionario_emisor || null,
        entidad_emisora || null,
        funcionario_receptor || null,
        entidad_receptora || null,
        registro_proceso || null,
        formatDateForMariaDB(fecha_inicio),
        formatDateForMariaDB(fecha_final),
        tipo_convenio || null,
        fase_registro || null,
        doc_pdf || null,
      ]
    );

    // 📌 Obtener la última fase de este convenio
    const latestFase = await query(
      `SELECT fase_registro 
      FROM registro_procesos 
      WHERE convenio_id = ? 
      ORDER BY id DESC LIMIT 1`,
      [convenio_id]
    );

    if (latestFase.length > 0) {
      // 📌 Actualizar fase_actual en convenios
      await query(
        `UPDATE convenios 
        SET fase_actual = ? 
        WHERE id = ?`,
        [latestFase[0].fase_registro, convenio_id]
      );
    }

    return NextResponse.json({ message: "Registro insertado y fase actualizada exitosamente" }, { status: 201 });

  } catch (error) {
    console.error("Error insertando registro:", error);
    return NextResponse.json({ error: "Error al insertar el registro" }, { status: 500 });
  }
}
// 📌 Actualizar un registro
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
    }

    // Lista de campos que puedes actualizar
    const camposPermitidos = [
      "entidad_proponente", 
      "autoridad_ministerial", 
      "funcionario_emisor",
      "entidad_emisora", 
      "funcionario_receptor", 
      "entidad_receptora",
      "registro_proceso", 
      "fecha_inicio", 
      "fecha_final", 
      "tipo_convenio",
      "fase_registro", 
      "doc_pdf"
    ];

    const updates = [];
    const values = [];

    for (const campo of camposPermitidos) {
      if (body[campo] !== undefined) {
        if (campo === "fecha_inicio" || campo === "fecha_final") {
          values.push(formatDateForMariaDB(body[campo]));
        } else {
          values.push(body[campo]);
        }
        updates.push(`${campo} = ?`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No se enviaron campos para actualizar" }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE registro_procesos SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    // Si mandaste convenio_id, actualiza la fase
    if (body.convenio_id) {
      const latestFase = await query(
        `SELECT fase_registro FROM registro_procesos WHERE convenio_id = ? ORDER BY id DESC LIMIT 1`,
        [body.convenio_id]
      );
      if (latestFase.length > 0) {
        await query(
          `UPDATE convenios SET fase_actual = ? WHERE id = ?`,
          [latestFase[0].fase_registro, body.convenio_id]
        );
      }
    }

    return NextResponse.json({ message: "Registro actualizado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando registro:", error);
    return NextResponse.json({ error: "Error al actualizar el registro" }, { status: 500 });
  }
}


// 📌 Eliminar un registro y actualizar fase_actual del convenio
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const convenio_id = searchParams.get("convenio_id");

    if (!id) throw new Error("ID no proporcionado");

    await query("DELETE FROM registro_procesos WHERE id = ?", [id]);

    // 📌 Obtener la última fase después de la eliminación
    const latestFase = await query(
      `SELECT fase_registro 
      FROM registro_procesos 
      WHERE convenio_id = ? 
      ORDER BY id DESC LIMIT 1`,
      [convenio_id]
    );

    // Si hay una fase, actualizarla en convenios. Si no hay registros, volver a "Negociación"
    await query(
      `UPDATE convenios 
      SET fase_actual = ? 
      WHERE id = ?`,
      [latestFase.length > 0 ? latestFase[0].fase_registro : "Negociación", convenio_id]
    );

    return NextResponse.json({ message: "Registro eliminado exitosamente" });

  } catch (error) {
    console.error("Error eliminando registro:", error);
    return NextResponse.json({ error: "Error al eliminar el registro" }, { status: 500 });
  }
}
