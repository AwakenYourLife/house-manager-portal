import { prisma } from "./db.ts";
import { addDays, dayKey, mondayOf } from "./days.ts";
import type { Shift } from "../generated/prisma/client.js";

export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

/** 1200 → "20h", 1215 → "20h 15m". */
export const hm = (mins: number) => {
  const sign = mins < 0 ? "−" : "";
  const m = Math.abs(mins);
  if (m < 60) return `${sign}${m}m`;
  return `${sign}${Math.floor(m / 60)}h${m % 60 ? " " + String(m % 60).padStart(2, "0") + "m" : ""}`;
};

/** Pay for a number of minutes at a rate, to the cent. */
export const payFor = (minutes: number, rateCents: number) => Math.round((minutes * rateCents) / 60);

export type PayShift = Shift & { minutes: number; live: boolean; forgotten: boolean };

export async function payrollSettings() {
  const [s, rates] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.payRate.findMany({ orderBy: { effectiveFrom: "asc" } }),
  ]);
  return { scheduledMinutes: s?.scheduledMinutes ?? 1200, rates };
}

/** The rate that applied to the week starting on a Monday: the latest one in effect by then. */
export function rateFor(monday: string, rates: { effectiveFrom: string; rateCents: number }[]): number {
  let r = rates[0]?.rateCents ?? 2500;
  for (const x of rates) if (x.effectiveFrom <= monday) r = x.rateCents;
  return r;
}

/**
 * Hours and pay, week by week, Monday to Sunday, newest first.
 *
 * Minutes are counted exactly from clock-in to clock-out. A shift still open
 * today counts up to now and is marked "so far". A shift left open on an
 * earlier day counts as nothing and is flagged: a forgotten clock-out would
 * otherwise bill every hour since, and the owner corrects it from the log.
 */
export async function payrollWeeks(count = 12) {
  const today = dayKey();
  const thisMonday = mondayOf(today);
  const first = addDays(thisMonday, -7 * (count - 1));
  const { scheduledMinutes, rates } = await payrollSettings();
  const shifts = await prisma.shift.findMany({ where: { date: { gte: first } }, orderBy: { clockIn: "asc" } });
  const now = Date.now();

  const weeks = [];
  for (let i = 0; i < count; i++) {
    const monday = addDays(thisMonday, -7 * i);
    const sunday = addDays(monday, 6);
    const rateCents = rateFor(monday, rates);
    const list: PayShift[] = shifts
      .filter((s) => s.date >= monday && s.date <= sunday)
      .map((s) => {
        const forgotten = !s.clockOut && s.date < today;
        const live = !s.clockOut && s.date === today;
        const end = s.clockOut ? s.clockOut.getTime() : live ? now : s.clockIn.getTime();
        return { ...s, minutes: Math.max(0, Math.round((end - s.clockIn.getTime()) / 60000)), live, forgotten };
      });
    const days = [...new Set(list.map((s) => s.date))].sort().map((date) => {
      const ds = list.filter((s) => s.date === date);
      return { date, shifts: ds, minutes: ds.reduce((m, s) => m + s.minutes, 0) };
    });
    const minutes = list.reduce((m, s) => m + s.minutes, 0);
    weeks.push({
      monday,
      sunday,
      current: monday === thisMonday,
      rateCents,
      minutes,
      payCents: payFor(minutes, rateCents),
      scheduledMinutes,
      scheduledPayCents: payFor(scheduledMinutes, rateCents),
      days,
      forgotten: list.filter((s) => s.forgotten),
      live: list.some((s) => s.live),
      corrected: list.some((s) => s.editedByOwner),
    });
  }
  return { weeks, scheduledMinutes, rates, currentRate: rateFor(thisMonday, rates), thisMonday };
}
