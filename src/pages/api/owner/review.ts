import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { isDayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const date = field(form.get("date"), 10);
  if (!isDayKey(date)) return redirect("/log?f=oops");
  const day = await prisma.day.findUnique({ where: { date } });
  if (!day) return redirect("/log?f=oops");
  await prisma.day.update({ where: { date }, data: { reviewNote: field(form.get("review"), 4000), reviewedAt: new Date() } });
  return redirect(`/log/${date}?f=reviewed`);
};
