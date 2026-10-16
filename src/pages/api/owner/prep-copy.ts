import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { addDays, isDayKey, mondayOf } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";

/** Copies last week's prep list into this one, unticked. Only offered while this week is empty. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const wk = field((await request.formData()).get("week"), 10);
  if (!isDayKey(wk)) return redirect("/kitchen?f=oops#prep");
  const weekOf = mondayOf(wk);
  if ((await prisma.prepItem.count({ where: { weekOf } })) === 0) {
    const last = await prisma.prepItem.findMany({ where: { weekOf: addDays(weekOf, -7) }, orderBy: { createdAt: "asc" } });
    for (const p of last) {
      await prisma.prepItem.create({ data: { weekOf, name: p.name, amount: p.amount, details: p.details, prepDay: p.prepDay } });
    }
  }
  return redirect(`/kitchen?week=${weekOf}&f=prep-copied#prep`);
};
