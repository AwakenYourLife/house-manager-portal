import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const p = await prisma.prepItem.findUnique({ where: { id: field(form.get("id"), 40) } });
  if (!p) return redirect("/kitchen?f=oops#prep");
  await prisma.prepItem.update({ where: { id: p.id }, data: { note: field(form.get("note"), 600) } });
  return redirect(`/kitchen?week=${p.weekOf}&f=prep-note#p-${p.id}`);
};
