/**
 * Windows EPERM on `prisma generate` is usually the query engine DLL still
 * loaded by Next/node. Free common dev ports first, then generate.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ports = ["3000", "3001", "3002", "3003"];

function killListenersWin() {
  const dir = mkdtempSync(join(tmpdir(), "pit-prisma-"));
  const ps1 = join(dir, "kill-ports.ps1");
  const lines = ports.map(
    (p) =>
      `Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`
  );
  writeFileSync(ps1, lines.join("\r\n"), "utf8");
  try {
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1}"`, {
      stdio: "ignore",
      windowsHide: true
    });
  } catch {
    // Ignore: no listeners, or need elevated rights for some processes
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

function killListenersUnix() {
  for (const port of ports) {
    try {
      execSync(`lsof -ti:${port} | xargs -r kill -9`, { stdio: "ignore", shell: true });
    } catch {
      // No listener
    }
  }
}

if (process.platform === "win32") {
  killListenersWin();
} else {
  killListenersUnix();
}

execSync("npx prisma generate", { stdio: "inherit", shell: true });
