import fs from "fs";
import { parse } from "dotenv";
import { spawn } from "child_process";

function checkNodeVersion() {
  const requiredMajor = 20;
  const currentMajor = parseInt(process.versions.node.split(".")[0], 10);

  if (currentMajor < requiredMajor) {
    console.error(
      `Node.js version ${requiredMajor} or higher is required. Current: ${process.version}`,
    );
    process.exit(1);
  } else {
    console.log(`Node.js version OK: ${process.version}`);
  }
}

function checkEnv() {
  const examplePath = ".env.example";
  const localCandidates = [".env.local", "env.local"];
  const localPath = localCandidates.find((p) => fs.existsSync(p));

  if (!fs.existsSync(examplePath)) {
    console.warn("No .env.example file found");
    return;
  }

  if (!localPath) {
    console.warn("No .env.local or env.local file found");
    return;
  }

  const example = parse(fs.readFileSync(examplePath));
  const local = parse(fs.readFileSync(localPath));

  const missing = Object.keys(example).filter((key) => !(key in local));

  if (missing.length) {
    console.warn(
      `Missing environment variables in ${localPath}: ${missing.join(", ")}`,
    );
  } else {
    console.log("All environment variables are present in", localPath);
  }
}

async function checkServer() {
  console.log("Starting server on port 8080...");
  const server = spawn("npm", ["run", "dev:server"], {
    env: { ...process.env, PORT: "8080" },
    stdio: "inherit",
  });

  const url = "http://localhost:8080/healthz";
  const timeoutMs = 15000;
  const start = Date.now();
  let healthy = false;

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        healthy = true;
        console.log("Health check success:", await res.text());
        break;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  server.kill("SIGINT");
  await new Promise((r) => server.on("exit", r));

  if (!healthy) {
    throw new Error("Health check failed");
  }
}

async function main() {
  try {
    checkNodeVersion();
    checkEnv();
    await checkServer();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();

