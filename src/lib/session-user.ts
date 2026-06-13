import { auth } from "@/auth";
import { userIsAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function requireUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    return { userId: null as string | null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: id, response: null as NextResponse | null };
}

export async function requireAdmin() {
  const { userId, response } = await requireUserId();
  if (!userId) return { userId: null as string | null, response: response! };

  const isAdmin = await userIsAdmin(userId);
  if (!isAdmin) {
    return {
      userId: null as string | null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  return { userId, response: null as NextResponse | null };
}
