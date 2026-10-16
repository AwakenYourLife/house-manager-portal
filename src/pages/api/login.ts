import type { APIRoute } from "astro";
import { COOKIE, cookieOptions, makeToken, roleForPassword } from "../../lib/auth.ts";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const next = String(form.get("next") ?? "/today");
  // Only ever back onto this site — an open redirect would let a lookalike link land elsewhere.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/today";

  const role = roleForPassword(String(form.get("password") ?? ""));
  if (!role) return redirect(`/login?bad=1&next=${encodeURIComponent(target)}`);

  cookies.set(COOKIE, makeToken(role), cookieOptions);
  // The duty list is the owner's; send a manager who followed a link there to Today instead.
  return redirect(role === "manager" && target.startsWith("/duties") ? "/today" : target);
};
