import type { APIRoute } from "astro";
import { COOKIE } from "../../lib/auth.ts";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(COOKIE, { path: "/" });
  return redirect("/login");
};
