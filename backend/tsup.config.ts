import { defineConfig } from "tsup";

export default defineConfig({
  // entry: ["src/server.ts"],
  entry: ["src/server.ts", "src/app.ts"],
  format: ["esm"], // Keep this as ESM
  target: "esnext",
  outDir: "dist",
  clean: true,
  bundle: true,
  publicDir: "src/assets",
  external: ["bcrypt"],
  splitting: false,
  sourcemap: true,

  // Add this banner to shim require() for CJS dependencies
  banner: {
    js: `
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  `,
  },
});
