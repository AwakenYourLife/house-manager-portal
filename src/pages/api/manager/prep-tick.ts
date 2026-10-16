import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const p = await prisma.prepItem.findUnique({ where: { id: field((await request.formData()).get("id"), 40) } });
  if (!p) return redirect("/kitchen?f=oops#prep");
  const done = !p.done;
  await prisma.prepItem.update({ where: { id: p.id }, data: { done, doneAt: done ? new Date() : null } });
  return redirect(`/kitchen?week=${p.weekOf}#p-${p.id}`);
};
