import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

//Borra el pdf directamente en uploads para evitar el gasto de memoria
//Actualmente solo esta implementado en oportunidades
export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "Falta el nombre del archivo" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", path.basename(fileName));

    if (fs.existsSync(filePath)) {
      console.log("Intentando borrar archivo:", filePath);
      fs.unlinkSync(filePath);
      return NextResponse.json({ message: "Archivo eliminado correctamente" });
    } else {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    return NextResponse.json({ error: "Error interno al eliminar archivo" }, { status: 500 });
  }
}
