import { prisma } from "./db.ts";
import { dayKey, isDue, sortDuties } from "./days.ts";
import type { Completion, Duty, Shift } from "../generated/prisma/client.js";

export type Item = { dutyId: string | null; title: string; duty: Duty | null; c: Completion | null };

export function workedMs(shifts: Shift[], now = new Date()): number {
  return shifts.reduce((ms, s) => ms + ((s.clockOut ?? now).getTime() - s.clockIn.getTime()), 0);
}

/**
 * Everything about one day in one place: the note, the shifts, and the list of
 * duties with how each went.
 *
 * Once a report is in, the list is the one frozen with it, so editing duties
 * later never rewrites what was due that day. Before that it is worked out from
 * the current duty list, plus anything ticked that has since been unscheduled.
 */
export async function loadDay(key: string) {
  const [day, shifts, completions, duties] = await Promise.all([
    prisma.day.findUnique({ where: { date: key } }),
    prisma.shift.findMany({ where: { date: key }, orderBy: { clockIn: "asc" } }),
    prisma.completion.findMany({ where: { date: key } }),
    prisma.duty.findMany(),
  ]);
  const dutyById = new Map(duties.map((d) => [d.id, d]));
  const byDuty = new Map(completions.filter((c) => c.dutyId).map((c) => [c.dutyId!, c]));

  let items: Item[];
  const snap = day?.dueSnapshot as { dutyId: string | null; title: string }[] | null | undefined;
  if (Array.isArray(snap)) {
    items = snap.map((s) => ({
      dutyId: s.dutyId,
      title: s.title,
      duty: (s.dutyId && dutyById.get(s.dutyId)) || null,
      c: (s.dutyId && byDuty.get(s.dutyId)) || completions.find((c) => !c.dutyId && c.title === s.title) || null,
    }));
  } else {
    items = duties
      .filter((d) => isDue(d, key))
      .sort(sortDuties)
      .map((d) => ({ dutyId: d.id, title: d.title, duty: d, c: byDuty.get(d.id) ?? null }));
    for (const c of completions) {
      if (c.done && !items.some((i) => i.c?.id === c.id)) {
        items.push({ dutyId: c.dutyId, title: c.title, duty: (c.dutyId && dutyById.get(c.dutyId)) || null, c });
      }
    }
  }

  const done = items.filter((i) => i.c?.done).length;
  return {
    key,
    day,
    shifts,
    items,
    done,
    total: items.length,
    openShift: shifts.find((s) => !s.clockOut) ?? null,
    worked: workedMs(shifts),
  };
}

export type LoadedDay = Awaited<ReturnType<typeof loadDay>>;

/** A shift left open on an earlier day — someone forgot to clock out. */
export function staleShift() {
  return prisma.shift.findFirst({ where: { clockOut: null, date: { lt: dayKey() } }, orderBy: { clockIn: "desc" } });
}

export function ensureDay(key: string) {
  return prisma.day.upsert({ where: { date: key }, create: { date: key }, update: {} });
}

export function unreadFor(role: "owner" | "manager") {
  return prisma.message.count({ where: { from: role === "owner" ? "manager" : "owner", readAt: null } });
}

/** Groups items by area, in the household's area order. */
export function byArea(items: Item[]): [string, Item[]][] {
  const groups = new Map<string, Item[]>();
  for (const i of items) {
    const a = i.duty?.area ?? "General";
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a)!.push(i);
  }
  return [...groups.entries()];
}
