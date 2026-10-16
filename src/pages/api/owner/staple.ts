import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { field } from "../../../lib/flash.ts";
import { LOCATIONS, int, syncStaple } from "../../../lib/kitchen.ts";

/** Adds a staple, or saves changes to one. Either way it is checked against its minimum straight after. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = field(form.get("id"), 40);
  const name = field(form.get("name"), 120);
  const minStock = int(form.get("minStock"));
  const onHand = int(form.get("onHand"));
  const back = id ? `/kitchen?editStaple=${id}&` : "/kitchen?";
  if (!name) return redirect(`${back}f=need-name#staple-form`);
  if (minStock === null || onHand === null) return redirect(`${back}f=bad-number#staple-form`);
  const location = field(form.get("location"), 30);
  const data = { name, unit: field(form.get("unit"), 30), location: LOCATIONS.includes(location) ? location : "Other", minStock };

  let sid = id;
  if (id) {
    const old = await prisma.staple.findUnique({ where: { id } });
    if (!old) return redirect("/kitchen?f=oops#staples");
    // A changed count is a count, so it is stamped like one.
    const counted = old.onHand !== onHand ? { onHand, countedAt: new Date(), countedBy: "owner" } : {};
    await prisma.staple.update({ where: { id }, data: { ...data, ...counted } });
  } else {
    sid = (await prisma.staple.create({ data: { ...data, onHand, countedAt: new Date(), countedBy: "owner" } })).id;
  }
  await syncStaple(sid);
  return redirect(`/kitchen?f=${id ? "staple-saved" : "staple-added"}#s-${sid}`);
};
