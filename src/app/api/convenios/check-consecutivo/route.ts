import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consecutivo = searchParams.get("consecutivo");

    if (!consecutivo) {
      return NextResponse.json({ error: "Falta el número de consecutivo" }, { status: 400 });
    }

    const result = await query(
      `SELECT id FROM convenios WHERE consecutivo_numerico = ? LIMIT 1`,
      [consecutivo]
    );

    return NextResponse.json({ exists: result.length > 0 });
  } catch (error) {
    console.error("Error verificando consecutivo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 })    
  }
}
