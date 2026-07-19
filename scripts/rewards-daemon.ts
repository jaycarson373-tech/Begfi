import "dotenv/config";
import { spawn, type ChildProcess } from "child_process";

const defaultIntervalMs = 60 * 60 * 1000;
const intervalMs = Number(process.env.REWARDS_EPOCH_MS || defaultIntervalMs);
const execute =
  process.env.REWARDS_DAEMON_EXECUTE === "true" || process.argv.includes("--execute");

if (!Number.isFinite(intervalMs) || intervalMs < 60_000) {
  throw new Error("REWARDS_EPOCH_MS must be at least 60000");
}

let stopping = false;
let activeChild: ChildProcess | null = null;

function runEpoch() {
  if (stopping) return;
  if (activeChild) {
    console.log("Previous rewards epoch is still running; skipping this tick.");
    return;
  }

  const args = ["--import", "tsx", "scripts/rewards-run.ts"];
  if (execute) args.push("--execute");

  activeChild = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  activeChild.once("exit", (code, signal) => {
    activeChild = null;

    if (signal) {
      console.error(`Rewards epoch stopped by ${signal}`);
    } else if (code) {
      console.error(`Rewards epoch exited with code ${code}`);
    }
  });
}

console.log(
  `POW rewards daemon started; epochs run every ${Math.round(
    intervalMs / 1000,
  )}s in ${execute ? "EXECUTE" : "PREVIEW"} mode.`,
);

runEpoch();
const timer = setInterval(runEpoch, intervalMs);

function stop() {
  stopping = true;
  clearInterval(timer);
  if (activeChild) activeChild.kill("SIGTERM");
  console.log("POW rewards daemon stopped.");
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
