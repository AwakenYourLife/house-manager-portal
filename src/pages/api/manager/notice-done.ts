import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field, safeBack } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const now = new Date();
  const n = await prisma.note.findUnique({ where: { id } });
  if (!n?.isTask || n.doneAt) return redirect(safeBack(field(form.get("back"), 20)));
  await prisma.note.update({ where: { id }, data: { doneAt: now, seenAt: n.seenAt ?? now, doneNote: field(form.get("doneNote"), 1000) } });
  return redirect(`${safeBack(field(form.get("back"), 20))}?f=notice-done`);
};
