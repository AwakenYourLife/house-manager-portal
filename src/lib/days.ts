/**
 * Dates and times, always in the household's zone (HOUSE_TZ) rather than the
 * reader's — the owner travelling and the manager at the house have to agree on
 * what "today" and "8:02 AM" mean.
 */
export const TZ = process.env.HOUSE_TZ || "America/New_York";

export const AREAS = ["Kitchen", "Cleaning", "Laundry", "Errands", "Kids & Pets", "Outdoor", "General"];
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Monday first, the way a work week is read. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function dayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

const noon = (key: string) => new Date(key + "T12:00:00Z");

export function isDayKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(noon(s).getTime());
}

export function weekdayOf(key: string): number {
  return noon(key).getUTCDay();
}

export function addDays(key: string, n: number): string {
  const d = noon(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function fmtDay(key: string, long = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: long ? "long" : "short",
    month: long ? "long" : "short",
    day: "numeric",
    ...(long ? { year: "numeric" as const } : {}),
  }).format(noon(key));
}

export function fmtTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
}

/** "HH:MM" in the household zone — the value a time input expects. */
export function hhmm(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
}

/** "14:30" → "2:30 PM". */
export function fmtClock(t: string): string {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function fmtDur(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

/** How far the household zone is ahead of UTC at a given instant. */
function offsetMs(at: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(at).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - at.getTime();
}

/** A wall-clock time on a household day, as a real instant. */
export function zonedTime(key: string, t: string): Date {
  const [y, mo, d] = key.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let ts = guess - offsetMs(new Date(guess));
  ts = guess - offsetMs(new Date(ts)); // second pass settles a DST edge
  return new Date(ts);
}

type Schedulable = { active: boolean; days: number[]; onceDate: string | null };

export function isDue(duty: Schedulable, key: string): boolean {
  if (!duty.active) return false;
  if (duty.onceDate) return duty.onceDate === key;
  return duty.days.includes(weekdayOf(key));
}

export function scheduleText(duty: { days: number[]; onceDate: string | null }): string {
  if (duty.onceDate) return "One time · " + fmtDay(duty.onceDate);
  const d = [...duty.days].sort().join();
  if (d === "0,1,2,3,4,5,6") return "Every day";
  if (d === "1,2,3,4,5") return "Weekdays";
  if (d === "0,6") return "Weekends";
  return WEEK_ORDER.filter((i) => duty.days.includes(i)).map((i) => WEEKDAYS[i]).join(", ") || "No days set";
}

type Sortable = { area: string; priority: boolean; dueBy: string; title: string };
export function sortDuties(a: Sortable, b: Sortable): number {
  const ai = AREAS.indexOf(a.area), bi = AREAS.indexOf(b.area);
  return (
    (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) ||
    Number(b.priority) - Number(a.priority) ||
    (a.dueBy || "99").localeCompare(b.dueBy || "99") ||
    a.title.localeCompare(b.title)
  );
}

/** The Monday that starts the week a day falls in. */
export function mondayOf(key: string): string {
  return addDays(key, -((weekdayOf(key) + 6) % 7));
}

/** "Today 3:12 PM", "Yesterday 9:05 AM", "Wed 3:12 PM", or "Oct 3" further back. */
export function fmtWhen(d: Date | null | undefined): string {
  if (!d) return "";
  const k = dayKey(d), today = dayKey();
  if (k === today) return "Today " + fmtTime(d);
  if (k === addDays(today, -1)) return "Yesterday " + fmtTime(d);
  if (k > addDays(today, -7)) return fmtDay(k).split(",")[0] + " " + fmtTime(d);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(k + "T12:00:00Z"));
}
