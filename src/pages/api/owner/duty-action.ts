import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const action = field(form.get("action"), 10);
  const duty = await prisma.duty.findUnique({ where: { id } });
  if (!duty) return redirect("/duties?f=oops");

  if (action === "pause" || action === "resume") {
    await prisma.duty.update({ where: { id }, data: { active: action === "resume" } });
    return redirect(`/duties?f=duty-${action === "pause" ? "paused" : "resumed"}`);
  }
  if (action === "delete") {
    // Past days keep their copy of the title, so the log still reads right.
    await prisma.duty.delete({ where: { id } });
    return redirect("/duties?f=duty-deleted");
  }
  return redirect("/duties?f=oops");
};
