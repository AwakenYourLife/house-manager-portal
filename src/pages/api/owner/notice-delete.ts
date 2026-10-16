import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field, safeBack } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  await prisma.note.deleteMany({ where: { id: field(form.get("id"), 40) } });
  return redirect(`${safeBack(field(form.get("back"), 20))}?f=notice-deleted`);
};
