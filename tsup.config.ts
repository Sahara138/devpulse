import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  sourcemap: true,
  clean: true,
//   minify: false,
  splitting: false,
//   dts: false,
  bundle: true,
//   platform: "node",
  banner: {
    js: `
        import {createRequire} from 'module';
        const require = createRequire(import.meta.url)
    `
}

});