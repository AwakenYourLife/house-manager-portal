import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const id = field((await request.formData()).get("id"), 40);
  await prisma.groceryItem.deleteMany({ where: { id, gotAt: null } });
  return redirect("/kitchen?f=grocery-removed#groceries");
};
