import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import pages from "vite-plugin-pages";

export default defineConfig({
  plugins: [pages(), react()],
});
