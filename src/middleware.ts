import { defineMiddleware } from "astro:middleware";
import { COOKIE, isConfigured, readToken } from "./lib/auth.ts";

/**
 * Every page needs a password except the sign-in page and the health check.
 * The duty list and the owner's actions need the owner's password; the clock,
 * the checklist and the report need the manager's, so the record of who did
 * what is always the person it says.
 */
const OPEN = ["/login", "/api/login", "/api/health"];

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/+$/, "") || "/";
  context.locals.role = readToken(context.cookies.get(COOKIE)?.value);

  if (OPEN.includes(path) || path.startsWith("/_astro/") || path === "/favicon.svg") return next();

  if (!isConfigured()) {
    return new Response(
      "This portal has no passwords set. Set OWNER_PASSWORD and MANAGER_PASSWORD and restart.",
      { status: 500, headers: { "content-type": "text/plain" } },
    );
  }

  const role = context.locals.role;
  if (!role) {
    if (path.startsWith("/api/")) return new Response("Sign in again.", { status: 401 });
    return context.redirect("/login?next=" + encodeURIComponent(context.url.pathname));
  }

  const ownerOnly = path === "/duties" || path.startsWith("/api/owner/");
  const managerOnly = path.startsWith("/api/manager/");
  if ((ownerOnly && role !== "owner") || (managerOnly && role !== "manager")) {
    return context.redirect("/today?f=not-yours");
  }
  return next();
});
