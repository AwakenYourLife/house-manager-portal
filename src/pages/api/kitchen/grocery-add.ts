import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const name = field(form.get("name"), 120);
  if (!name) return redirect("/kitchen?f=need-name#groceries");
  await prisma.groceryItem.create({ data: { name, qty: field(form.get("qty"), 60), addedBy: locals.role! } });
  return redirect("/kitchen?f=grocery-added#groceries");
};
