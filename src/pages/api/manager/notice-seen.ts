import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field, safeBack } from "../../../lib/flash.ts";

/** "Got it" — the owner sees the time it was tapped. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const back = safeBack(field(form.get("back"), 20));
  const n = await prisma.note.findUnique({ where: { id: field(form.get("id"), 40) } });
  if (!n) return redirect(`${back}?f=oops`);
  if (!n.seenAt) await prisma.note.update({ where: { id: n.id }, data: { seenAt: new Date() } });
  return redirect(`${back}?f=notice-seen#n-${n.id}`);
};
