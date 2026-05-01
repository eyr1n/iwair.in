import type { AstroUserConfig } from "astro";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  site: "https://iwair.in",
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
  },
} as AstroUserConfig;
