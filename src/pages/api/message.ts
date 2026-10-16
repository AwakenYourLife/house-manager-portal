import type { APIRoute } from "astro";
import { prisma } from "../../lib/db.ts";
import { field } from "../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const body = field((await request.formData()).get("body"), 4000);
  if (!body) return redirect("/messages?f=need-body");
  await prisma.message.create({ data: { from: locals.role!, body } });
  return redirect("/messages");
};
