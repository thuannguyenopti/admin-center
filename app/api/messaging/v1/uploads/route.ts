<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Attachment } from "@/app/opal/im/lib/types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "im-uploads");

async function ensureDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  await ensureDir();
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = safeName(file.name || "upload");
  const stored = `${id}-${fileName}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, stored), buf);

  const attachment: Attachment = {
    file_id: id,
    file_name: file.name || fileName,
    mime_type: file.type || "application/octet-stream",
    file_size: buf.byteLength,
    thumbnail_url: `/im-uploads/${stored}`,
  };
  return NextResponse.json(attachment);
}
=======
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Attachment } from "@/app/opal/im/lib/types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "im-uploads");

async function ensureDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  await ensureDir();
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = safeName(file.name || "upload");
  const stored = `${id}-${fileName}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, stored), buf);

  const attachment: Attachment = {
    file_id: id,
    file_name: file.name || fileName,
    mime_type: file.type || "application/octet-stream",
    file_size: buf.byteLength,
    thumbnail_url: `/im-uploads/${stored}`,
  };
  return NextResponse.json(attachment);
}
>>>>>>> origin/main
