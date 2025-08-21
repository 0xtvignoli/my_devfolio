#!/usr/bin/env node

const net = require("net");
const { spawn } = require("child_process");

const BASE_PORT = Number(process.env.BASE_PORT || 9002);
const MAX_TRIES = Number(process.env.MAX_PORT_TRIES || 100);

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host: "::" }, () => {
      const assigned = server.address();
      server.close(() => resolve(assigned && assigned.port === port));
    });
  });
}

async function findAvailablePort(start) {
  for (let i = 0; i < MAX_TRIES; i++) {
    const port = start + i;
    // eslint-disable-next-line no-await-in-loop
    const free = await checkPort(port);
    if (free) return port;
  }
  throw new Error(`No available port found in range ${start}-${start + MAX_TRIES - 1}`);
}

async function main() {
  const port = await findAvailablePort(BASE_PORT);

  if (process.env.PORT_CHECK_ONLY === "1") {
    console.log(String(port));
    return;
  }

  if (port !== BASE_PORT) {
    console.log(`Port ${BASE_PORT} is in use. Starting on ${port} instead.`);
  }

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "dev", "--turbopack", "-p", String(port)],
    {
      stdio: "inherit",
      env: { ...process.env, PORT: String(port) },
    }
  );

  const forward = (signal) => {
    try {
      child.kill(signal);
    } catch {
      // ignore
    }
  };

  process.on("SIGINT", () => forward("SIGINT"));
  process.on("SIGTERM", () => forward("SIGTERM"));

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
