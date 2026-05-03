import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  site: "https://iwair.in",
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
  },
  integrations: [solidJs()],
});
