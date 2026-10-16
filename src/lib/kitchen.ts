import { prisma } from "./db.ts";
import type { Staple } from "../generated/prisma/client.js";

export const LOCATIONS = ["Pantry", "Fridge", "Freezer", "Cleaning", "Bathroom", "Other"];

export const WHO: Record<string, string> = { owner: "Owner", manager: "House manager", auto: "Low stock" };

/**
 * "below" — under the minimum, which the owner asked never to happen.
 * "at"    — exactly at it: one more use and it's below, so it's time to buy.
 */
export function stapleStatus(s: Pick<Staple, "onHand" | "minStock">): "below" | "at" | "ok" {
  return s.onHand < s.minStock ? "below" : s.onHand === s.minStock ? "at" : "ok";
}

export function stapleQty(s: Pick<Staple, "onHand" | "minStock" | "unit">): string {
  return `have ${s.onHand}, min ${s.minStock}${s.unit ? " " + s.unit : ""}`;
}

/**
 * Keeps the grocery list in step with one staple. At or below its minimum, it
 * gets exactly one open item on the list; once restocked above it, an item the
 * portal added on its own is taken off again. An item a person added by hand
 * is never removed for them.
 */
export async function syncStaple(id: string) {
  const s = await prisma.staple.findUnique({ where: { id } });
  if (!s) return;
  const open = await prisma.groceryItem.findFirst({ where: { stapleId: id, gotAt: null } });
  if (stapleStatus(s) !== "ok") {
    const qty = stapleQty(s);
    if (!open) await prisma.groceryItem.create({ data: { name: s.name, qty, addedBy: "auto", stapleId: id } });
    else if (open.addedBy === "auto" && (open.qty !== qty || open.name !== s.name)) {
      await prisma.groceryItem.update({ where: { id: open.id }, data: { qty, name: s.name } });
    }
  } else if (open?.addedBy === "auto") {
    await prisma.groceryItem.delete({ where: { id: open.id } });
  }
}

export function int(v: FormDataEntryValue | null, max = 100000): number | null {
  const n = Number(typeof v === "string" ? v.trim() : NaN);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
}

export async function kitchenSummary(weekOf: string) {
  const [prep, open, staples] = await Promise.all([
    prisma.prepItem.findMany({ where: { weekOf }, select: { done: true } }),
    prisma.groceryItem.count({ where: { gotAt: null } }),
    prisma.staple.findMany({ select: { onHand: true, minStock: true } }),
  ]);
  return {
    prepDone: prep.filter((p) => p.done).length,
    prepTotal: prep.length,
    groceries: open,
    below: staples.filter((s) => stapleStatus(s) === "below").length,
    at: staples.filter((s) => stapleStatus(s) === "at").length,
  };
}
