import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET() {
  try {
    const convenios = await query("SELECT * FROM convenios");

    const registros = await query(`
      SELECT convenio_id, MAX(fase_registro) as fase_actual 
      FROM registro_procesos 
      GROUP BY convenio_id
    `);

    const totalConveniosRes = await query("SELECT COUNT(*) AS total FROM convenios");
    const totalCooperantesRes = await query("SELECT COUNT(DISTINCT cooperante) AS total FROM convenios");

    const totalConvenios = Number(totalConveniosRes[0]?.total || 0);
    const totalCooperantes = Number(totalCooperantesRes[0]?.total || 0);

    const sanitizeValue = (value: any) => (value === undefined || value === "" ? null : value);

    const conveniosActualizados = convenios.map((convenio: any) => ({
      id: sanitizeValue(convenio.id),
      cooperante: sanitizeValue(convenio.cooperante),
      nombre: sanitizeValue(convenio.nombre),
      sector: sanitizeValue(convenio.sector),
      fase_actual: sanitizeValue(
        registros.find((r: any) => r.convenio_id === convenio.id)?.fase_actual
      ) || "Negociación",
      firmado: sanitizeValue(convenio.firmado),
      consecutivo_numerico: sanitizeValue(convenio.consecutivo_numerico),
      fecha_inicio: sanitizeValue(convenio.fecha_inicio),
    }));

    return NextResponse.json({ totalConvenios, totalCooperantes, convenios: conveniosActualizados }, { status: 200 });

  } catch (error) {
    console.error(" Error obteniendo convenios:", error);
    return NextResponse.json({ error: "Error al obtener convenios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cooperante, nombre, sector, fase_actual, firmado, consecutivo_numerico, fecha_inicio } = body;

    if (!cooperante || !nombre || (!sector && sector !== "Otro") || consecutivo_numerico === undefined) {
      console.error(" Campos inválidos:", body);
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO convenios (cooperante, nombre, sector, fase_actual, firmado, consecutivo_numerico, fecha_inicio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cooperante, nombre, sector, fase_actual, firmado, consecutivo_numerico, fecha_inicio || null]
    );

    return NextResponse.json({ message: "Convenio agregado correctamente" }, { status: 201 });

  } catch (error) {
    console.error(" Error insertando convenio:", error);
    return NextResponse.json({ error: "Error al guardar el convenio" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, cooperante, nombre, sector, fase_actual, firmado, consecutivo_numerico } = body;

    if (!id || !cooperante || !nombre || (!sector && sector !== "Otro")) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const result = await query(
      `UPDATE convenios 
       SET cooperante = ?, nombre = ?, sector = ?, fase_actual = ?, firmado = ?, consecutivo_numerico = ?
       WHERE id = ?`,
      [cooperante, nombre, sector, fase_actual, firmado, consecutivo_numerico, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Convenio no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Convenio actualizado correctamente" }, { status: 200 });

  } catch (error) {
    console.error(" Error actualizando convenio:", error);
    return NextResponse.json({ error: "Error al actualizar el convenio" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "ID del convenio es obligatorio" }, { status: 400 });
      }
  
      // Eliminar el convenio con el ID proporcionado
      const result = await query("DELETE FROM convenios WHERE id = ?", [id]);
  
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Convenio no encontrado" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Convenio eliminado correctamente" }, { status: 200 });
  
    } catch (error) {
      console.error(" Error eliminando convenio:", error);
      return NextResponse.json({ error: "Error al eliminar el convenio" }, { status: 500 });
    }
  }
  