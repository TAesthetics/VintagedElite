import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const entry = ".output/server/index.mjs";
if (!existsSync(entry)) {
  console.error(
    `[start] ${entry} fehlt. Auf Railway mit NITRO_PRESET=node-server bauen.`,
  );
  process.exit(1);
}

// The bundled PGLite looks for its data file next to the chunk, not in node_modules.
const pgliteDist = "node_modules/@electric-sql/pglite/dist";
const pgliteChunk = ".output/server/_libs";
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(pgliteDist, name);
  const to = join(pgliteChunk, name);
  if (existsSync(from) && !existsSync(to)) copyFileSync(from, to);
}

process.env.HOST = process.env.HOST || "0.0.0.0";
process.env.PORT = process.env.PORT || "8080";

const child = spawn(process.execPath, [entry], { stdio: "inherit", env: process.env });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
