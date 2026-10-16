import type { APIRoute } from "astro";
import { prisma } from "../../lib/db.ts";
import { TZ, dayKey } from "../../lib/days.ts";

/** Says plainly whether the database answered and the passwords are set, so a deploy shipped without its environment is caught on its own URL. */
export const GET: APIRoute = async () => {
  let database = "unreachable";
  let error: string | null = null;
  try {
    await prisma.duty.count();
    database = "ok";
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  const owner = process.env.OWNER_PASSWORD, manager = process.env.MANAGER_PASSWORD;
  const body = {
    database,
    error,
    passwordsSet: Boolean(owner && manager),
    // Identical passwords would sign the manager in as the owner.
    passwordsDiffer: owner !== manager,
    timeZone: TZ,
    today: dayKey(),
    commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? null,
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: database === "ok" ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
};
