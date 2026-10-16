import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";
import { syncStaple } from "../../../lib/kitchen.ts";

/** Puts a checked-off item back on the list, and takes what was bought back off a staple's count. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const item = await prisma.groceryItem.findUnique({ where: { id: field((await request.formData()).get("id"), 40) } });
  if (!item?.gotAt) return redirect("/kitchen#groceries");

  if (item.stapleId) {
    // An open item for the staple may have been raised since; this one replaces it.
    await prisma.groceryItem.deleteMany({ where: { stapleId: item.stapleId, gotAt: null, addedBy: "auto" } });
    const s = await prisma.staple.findUnique({ where: { id: item.stapleId } });
    if (s && item.boughtQty) {
      await prisma.staple.update({ where: { id: s.id }, data: { onHand: Math.max(0, s.onHand - item.boughtQty) } });
    }
  }
  await prisma.groceryItem.update({ where: { id: item.id }, data: { gotAt: null, gotBy: null, boughtQty: null } });
  if (item.stapleId) await syncStaple(item.stapleId);
  return redirect("/kitchen?f=grocery-undone#groceries");
};
