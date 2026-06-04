import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Exposes `virtual:model-manifest` — the list of god ids that actually have a
 * model file in public/models. The statue component only invokes the GLTF
 * loader for ids in this list, so empty slots fall back to the placeholder
 * silently (no 404 console noise). Hot-reloads when files are added/removed.
 */
function modelManifest(): Plugin {
  const dir = path.resolve(__dirname, "public/models");
  const id = "virtual:model-manifest";
  const resolved = "\0" + id;
  const read = () => {
    try {
      return fs
        .readdirSync(dir)
        .filter((f) => /\.(glb|gltf)$/i.test(f))
        .map((f) => f.replace(/\.(glb|gltf)$/i, ""));
    } catch {
      return [];
    }
  };
  return {
    name: "model-manifest",
    resolveId: (s) => (s === id ? resolved : undefined),
    load: (i) => (i === resolved ? `export default ${JSON.stringify(read())}` : undefined),
    configureServer(server) {
      server.watcher.add(dir);
      const reload = (p: string) => {
        if (!p.startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(resolved);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
    },
  };
}

// The single source of truth (handoff/pantheon.json) lives one level up from
// the app, so allow Vite's dev server to read the parent directory.
export default defineConfig({
  plugins: [react(), modelManifest()],
  server: {
    fs: { allow: [".."] },
  },
});
