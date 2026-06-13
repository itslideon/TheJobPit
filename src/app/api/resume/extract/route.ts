import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session-user";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".pdf")) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buf });
      try {
        const parsed = await parser.getText();
        const text = String(parsed.text ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 100_000);
        if (!text) {
          return NextResponse.json(
            { error: "PDF had no extractable text. Paste resume text manually." },
            { status: 400 }
          );
        }
        return NextResponse.json({ data: { text, format: "pdf" as const } });
      } finally {
        await parser.destroy();
      }
    } catch {
      return NextResponse.json({ error: "Could not read PDF." }, { status: 400 });
    }
  }

  const text = buf.toString("utf8").replace(/\s+/g, " ").trim().slice(0, 100_000);
  if (!text) {
    return NextResponse.json({ error: "File was empty or unreadable." }, { status: 400 });
  }
  return NextResponse.json({ data: { text, format: "text" as const } });
}
