import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { isDayKey } from "../../../lib/days.ts";
import { field, safeBack } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const back = safeBack(field(form.get("back"), 20));
  const body = field(form.get("body"), 4000);
  if (!body) return redirect(`${back}?f=need-body`);
  const due = field(form.get("dueDate"), 10);
  const isTask = form.get("isTask") === "on" || isDayKey(due);
  await prisma.note.create({ data: { body, isTask, dueDate: isDayKey(due) ? due : null } });
  return redirect(`${back}?f=notice-sent`);
};
