import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET() {
  try {
    const result = await query(`SELECT MAX(consecutivo_numerico) AS maxConsecutivo FROM convenios`);
    const maxConsecutivo = result[0]?.maxConsecutivo || 0;
    return NextResponse.json({ maxConsecutivo });
  } catch (error) {
    console.error("Error obteniendo el máximo consecutivo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });

  }
}
