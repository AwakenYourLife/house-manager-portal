import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const id = field((await request.formData()).get("id"), 40);
  // Its automatic grocery item goes with it; anything already bought stays in the picked-up list.
  await prisma.$transaction([
    prisma.groceryItem.deleteMany({ where: { stapleId: id, gotAt: null, addedBy: "auto" } }),
    prisma.staple.deleteMany({ where: { id } }),
  ]);
  return redirect("/kitchen?f=staple-deleted#staples");
};
