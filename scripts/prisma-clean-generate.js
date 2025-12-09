const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function log(level, msg) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${level}] ${ts} ${msg}\n`);
}

function safeRm(target) {
  try {
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    return true;
  } catch (e) {
    try {
      const tmp = `${target}.tmp_${Date.now()}`;
      fs.renameSync(target, tmp);
      fs.rmSync(tmp, { recursive: true, force: true });
      return true;
    } catch (err) {
      log("WARN", `Failed to remove ${target}: ${err.message}`);
      return false;
    }
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  return r.status === 0;
}

const root = process.cwd();
const clientDir = path.join(root, "node_modules", ".prisma");
log("INFO", `Cleaning ${clientDir}`);
safeRm(clientDir);

log("INFO", "Generating Prisma Client");
const ok = run("npx", ["prisma", "generate"], root);
if (!ok) {
  log("ERROR", "Prisma generate failed");
  process.exit(1);
}
log("INFO", "Prisma Client generated successfully");
