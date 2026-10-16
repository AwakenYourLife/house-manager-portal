import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";
import { int, syncStaple } from "../../../lib/kitchen.ts";

/** A fresh count of one staple. Who counted and when is kept, so a stale count shows. */
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const onHand = int(form.get("onHand"));
  if (onHand === null) return redirect("/kitchen?f=bad-number#staples");
  const found = await prisma.staple.findUnique({ where: { id } });
  if (!found) return redirect("/kitchen?f=oops#staples");
  await prisma.staple.update({ where: { id }, data: { onHand, countedAt: new Date(), countedBy: locals.role! } });
  await syncStaple(id);
  return redirect(`/kitchen?f=count-saved#s-${id}`);
};
