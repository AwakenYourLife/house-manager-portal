// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// Every page reads or writes the household's day, so the whole portal is
// server-rendered.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  devToolbar: { enabled: false },

  security: {
    // Behind Render's proxy the rebuilt request URL loses its port, so Astro's
    // origin check rejects every form post. Forgery is stopped instead by the
    // session cookie being SameSite=Lax: a post started by another site arrives
    // with no session and the middleware turns it away.
    checkOrigin: false,
  },
});
