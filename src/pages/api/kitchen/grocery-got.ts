import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";
import { int, syncStaple } from "../../../lib/kitchen.ts";

/**
 * Checks an item off. For a pantry staple, how many were bought is required and
 * goes straight onto its count, so the stock level is right without a recount.
 */
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const item = await prisma.groceryItem.findUnique({ where: { id: field(form.get("id"), 40) } });
  if (!item || item.gotAt) return redirect("/kitchen#groceries");

  const now = new Date();
  if (item.stapleId) {
    const bought = int(form.get("bought"), 9999);
    if (!bought) return redirect("/kitchen?f=need-bought#groceries");
    await prisma.$transaction([
      prisma.groceryItem.update({ where: { id: item.id }, data: { gotAt: now, gotBy: locals.role!, boughtQty: bought } }),
      prisma.staple.update({ where: { id: item.stapleId }, data: { onHand: { increment: bought }, countedAt: now, countedBy: locals.role! } }),
    ]);
    await syncStaple(item.stapleId);
    return redirect("/kitchen?f=grocery-got-staple#groceries");
  }
  await prisma.groceryItem.update({ where: { id: item.id }, data: { gotAt: now, gotBy: locals.role! } });
  return redirect("/kitchen?f=grocery-got#groceries");
};
