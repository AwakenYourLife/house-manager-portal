import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";

export const POST: APIRoute = async ({ redirect }) => {
  await prisma.groceryItem.deleteMany({ where: { gotAt: { not: null } } });
  return redirect("/kitchen?f=grocery-cleared#groceries");
};
