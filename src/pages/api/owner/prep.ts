import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { isDayKey, mondayOf } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const wk = field(form.get("week"), 10);
  if (!isDayKey(wk)) return redirect("/kitchen?f=oops#prep");
  const weekOf = mondayOf(wk);
  const wq = `week=${weekOf}&`;
  const name = field(form.get("name"), 200);
  if (!name) return redirect(`/kitchen?${wq}${id ? `editPrep=${id}&` : ""}f=need-name#prep-form`);
  const d = Number(field(form.get("prepDay"), 1));
  const data = {
    name,
    amount: field(form.get("amount"), 80),
    details: field(form.get("details"), 2000),
    prepDay: form.get("prepDay") !== "" && Number.isInteger(d) && d >= 0 && d <= 6 ? d : null,
  };
  if (id) {
    const found = await prisma.prepItem.findUnique({ where: { id } });
    if (!found) return redirect(`/kitchen?${wq}f=oops#prep`);
    await prisma.prepItem.update({ where: { id }, data });
    return redirect(`/kitchen?${wq}f=prep-saved#p-${id}`);
  }
  const p = await prisma.prepItem.create({ data: { ...data, weekOf } });
  return redirect(`/kitchen?${wq}f=prep-added#p-${p.id}`);
};
