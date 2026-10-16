import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const p = await prisma.prepItem.findUnique({ where: { id: field((await request.formData()).get("id"), 40) } });
  if (!p) return redirect("/kitchen#prep");
  await prisma.prepItem.delete({ where: { id: p.id } });
  return redirect(`/kitchen?week=${p.weekOf}&f=prep-deleted#prep`);
};
