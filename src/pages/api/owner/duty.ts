import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { AREAS, isDayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";

/** Adds a duty, or saves changes to one. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const title = field(form.get("title"), 200);
  const back = id ? `/duties?edit=${id}` : "/duties?new=1";
  if (!title) return redirect(`${back}&f=need-title#form`);

  const once = form.get("kind") === "once";
  const onceDate = field(form.get("onceDate"), 10);
  const days = [...new Set(form.getAll("days").map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))];
  if (once ? !isDayKey(onceDate) : days.length === 0) return redirect(`${back}&f=need-days#form`);

  const area = field(form.get("area"), 40);
  const dueBy = field(form.get("dueBy"), 5);
  const data = {
    title,
    details: field(form.get("details"), 2000),
    area: AREAS.includes(area) ? area : "General",
    days: once ? [] : days.sort(),
    onceDate: once ? onceDate : null,
    dueBy: /^\d{2}:\d{2}$/.test(dueBy) ? dueBy : "",
    priority: form.get("priority") === "on",
  };

  if (id) {
    const found = await prisma.duty.findUnique({ where: { id } });
    if (!found) return redirect("/duties?f=oops");
    await prisma.duty.update({ where: { id }, data });
    return redirect("/duties?f=duty-saved");
  }
  await prisma.duty.create({ data });
  return redirect("/duties?f=duty-added");
};
