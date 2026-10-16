import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";
import { ensureDay } from "../../../lib/house.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const note = field((await request.formData()).get("note"), 4000);
  const date = dayKey();
  await ensureDay(date);
  await prisma.day.update({ where: { date }, data: { ownerNote: note } });
  return redirect(`/today?f=${note ? "owner-note" : "owner-note-cleared"}`);
};
