import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/session-user";
import { matchOpenings } from "@/lib/job-match";

const bodySchema = z.object({
  company: z.string().trim().max(200).optional(),
  role: z.string().trim().max(200).optional(),
  jobType: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  skills: z.array(z.string().trim().max(60)).max(40).optional(),
  resumeText: z.string().max(120_000).optional(),
  page: z.number().int().min(1).max(50).optional(),
  limit: z.number().int().min(1).max(20).optional()
});

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid match payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { matches, meta } = await matchOpenings(parsed.data, {
    page: parsed.data.page,
    limit: parsed.data.limit
  });
  return NextResponse.json({ data: matches, meta });
}
