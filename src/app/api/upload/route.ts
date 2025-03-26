import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const id = formData.get("id")?.toString();

  if (!file || !id) {
    return NextResponse.json({ error: "Archivo o ID faltante" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = path.extname(file.name) || ".pdf";
  const filename = `documento-${id}-${randomUUID()}${extension}`;

  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(filePath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url }, { status: 200 });
}
