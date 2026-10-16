import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";

/** A first list to edit, so the owner isn't starting from a blank page. Only offered while there are no duties. */
const W = [1, 2, 3, 4, 5];
const STARTER = [
  { title: "Unload dishwasher and wipe kitchen counters", area: "Kitchen", days: W, dueBy: "10:00" },
  { title: "Make beds and tidy the living areas", area: "Cleaning", days: W },
  { title: "Take out trash and recycling", area: "Kitchen", days: [1, 4], priority: true },
  { title: "Wash, fold and put away laundry", area: "Laundry", days: [1, 3, 5] },
  { title: "Check pantry and update the grocery list", area: "Errands", days: [2] },
  { title: "Grocery run from the shared list", area: "Errands", days: [3] },
  { title: "Water indoor plants", area: "General", days: [2, 5] },
  { title: "Feed and walk the dog", area: "Kids & Pets", days: W, dueBy: "12:00", priority: true },
];

export const POST: APIRoute = async ({ redirect }) => {
  if ((await prisma.duty.count()) > 0) return redirect("/duties");
  await prisma.duty.createMany({ data: STARTER });
  return redirect("/duties?f=starter");
};
