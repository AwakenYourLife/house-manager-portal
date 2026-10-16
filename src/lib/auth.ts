import "dotenv/config";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Two passwords, not accounts: one for the owner, one for the house manager.
 * The password typed on the sign-in page decides which side opens.
 *
 * Each session is signed with its own role's password, so changing
 * MANAGER_PASSWORD signs the manager out everywhere and leaves the owner alone.
 */

export type Role = "owner" | "manager";
export const COOKIE = "house_session";
const MAX_AGE = 60 * 60 * 24 * 60; // two months: a phone stays signed in

function passwordFor(role: Role): string | undefined {
  return role === "owner" ? process.env.OWNER_PASSWORD : process.env.MANAGER_PASSWORD;
}

export function isConfigured(): boolean {
  return Boolean(process.env.OWNER_PASSWORD && process.env.MANAGER_PASSWORD);
}

/** Constant-time compare, so a wrong password can't be found a letter at a time. */
function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function roleForPassword(supplied: string): Role | null {
  for (const role of ["owner", "manager"] as const) {
    const p = passwordFor(role);
    if (p && same(p, supplied ?? "")) return role;
  }
  return null;
}

function sign(role: Role, issued: string): string {
  return createHmac("sha256", passwordFor(role)!).update(`${role}.${issued}`).digest("hex");
}

export function makeToken(role: Role): string {
  const issued = String(Date.now());
  return `${role}.${issued}.${sign(role, issued)}`;
}

export function readToken(token: string | undefined): Role | null {
  if (!token || !isConfigured()) return null;
  const [role, issued, sig] = token.split(".");
  if (role !== "owner" && role !== "manager") return null;
  if (!issued || !sig || !same(sig, sign(role, issued))) return null;
  const age = (Date.now() - Number(issued)) / 1000;
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE ? role : null;
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};
