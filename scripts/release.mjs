#!/usr/bin/env node
/**
 * One-command releases for The Artist Post app. See docs/RELEASING.md.
 *
 *   node scripts/release.mjs check
 *       Runs the gates only: typecheck, lint, tests, expo-doctor.
 *
 *   node scripts/release.mjs ota "What changed, in plain words"
 *       Gates -> publish an OTA update to the production channel.
 *       Add --channel preview to publish to the preview channel instead.
 *
 *   node scripts/release.mjs native
 *       Gates -> iOS production build with auto-submit to TestFlight, plus an
 *       Android preview build (an installable APK, no Play Store account).
 *       Builds run in EAS cloud; this prints their links and returns.
 *
 * Flags (anywhere after the command):
 *   --dry-run     Do every check, then print the publish/build commands
 *                 instead of running them. Nothing is published.
 *   --no-gates    Skip the gates. Only honoured together with --dry-run, to
 *                 check the script's own plumbing quickly.
 *   --channel X   (ota) production (default) or preview.
 *
 * Refuses to run on a dirty working tree. Production releases must be cut
 * from main, up to date with origin/main. No secrets are read or printed:
 * EAS keeps credentials server-side and the CLI uses the logged-in session.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const EAS = ["eas-cli@latest"];

const GATES = [
  { name: "Typecheck", cmd: "npx", args: ["tsc", "--noEmit"] },
  { name: "Lint", cmd: "npx", args: ["expo", "lint"] },
  { name: "Unit tests", cmd: "npx", args: ["jest", "--ci"] },
  { name: "Expo Doctor", cmd: "npx", args: ["expo-doctor"] },
];

const CHANNELS = new Set(["production", "preview"]);

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function step(message) {
  console.log(`\n▶ ${message}`);
}

/** Quote one argument for a shell. Only conservative text gets through. */
function quote(arg) {
  if (/[\r\n"%^`$\\]/.test(arg)) {
    fail(`Argument contains a character this script will not pass to a shell: ${JSON.stringify(arg)}`);
  }
  return /^[\w@./:=+,-]+$/.test(arg) ? arg : `"${arg}"`;
}

/**
 * Run a command in the repo. `capture` returns stdout (stderr stays on the
 * terminal so progress is visible). Returns { status, stdout }.
 */
function run(cmd, args, { capture = false } = {}) {
  const line = [cmd, ...args].map(quote).join(" ");
  const result = spawnSync(line, {
    cwd: root,
    shell: true,
    stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    env: { ...process.env, CI: process.env.CI ?? "1" },
  });
  return { status: result.status ?? 1, stdout: result.stdout ?? "" };
}

function git(args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return { status: result.status ?? 1, out: (result.stdout ?? "").trim() };
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = { dryRun: false, gates: true, channel: "production" };
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--no-gates") flags.gates = false;
    else if (arg === "--channel") flags.channel = rest[++i] ?? "";
    else if (arg.startsWith("--channel=")) flags.channel = arg.slice("--channel=".length);
    else if (arg.startsWith("--")) fail(`Unknown flag ${arg}.`);
    else positional.push(arg);
  }
  return { command, flags, positional };
}

function checkTree({ requireMain, dryRun = false }) {
  step("Checking the working tree");
  const status = git(["status", "--porcelain"]);
  if (status.status !== 0) fail("This is not a git checkout.");
  if (status.out) {
    fail(`The working tree has uncommitted changes. Commit or discard them first:\n${status.out}`);
  }
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).out;
  const head = git(["rev-parse", "HEAD"]).out;
  console.log(`  clean · ${branch} @ ${head.slice(0, 7)}`);

  if (!requireMain) return { branch, head };

  // A dry run reports these instead of stopping, so the rest can be rehearsed.
  const refuse = (message) => {
    if (dryRun) console.warn(`  ⚠ A real release would stop here: ${message}`);
    else fail(message);
  };
  if (branch !== "main") {
    refuse(`Production releases are cut from main, and this is "${branch}". Merge your PR first.`);
    return { branch, head };
  }
  git(["fetch", "origin", "main", "--quiet"]);
  const remote = git(["rev-parse", "origin/main"]).out;
  if (remote && remote !== head) {
    refuse("main is not the same commit as origin/main. Pull (or push) so you release exactly what is on GitHub.");
  }
  return { branch, head };
}

function runGates({ enabled, dryRun }) {
  if (!enabled) {
    if (!dryRun) fail("--no-gates is only allowed together with --dry-run.");
    step("Gates skipped (--no-gates, dry run)");
    return;
  }
  const results = [];
  for (const gate of GATES) {
    step(`${gate.name}: ${[gate.cmd, ...gate.args].join(" ")}`);
    const { status } = run(gate.cmd, gate.args);
    results.push({ name: gate.name, ok: status === 0 });
    if (status !== 0) {
      console.error(`\nGate summary so far:`);
      for (const r of results) console.error(`  ${r.ok ? "✔" : "✖"} ${r.name}`);
      fail(`${gate.name} failed. Nothing was published. Fix it and run the release again.`);
    }
  }
  console.log("\n✔ All gates passed:");
  for (const r of results) console.log(`  ✔ ${r.name}`);
}

/** Pull the first JSON array/object out of stdout that may carry log noise. */
function parseJson(text) {
  const start = text.search(/[[{]/);
  if (start === -1) return null;
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return null;
  }
}

function releaseOta({ flags, positional }) {
  const message = positional.join(" ").trim();
  if (!message) {
    fail('Say what changed: node scripts/release.mjs ota "Fix the RSVP button on small phones"');
  }
  if (!CHANNELS.has(flags.channel)) {
    fail(`--channel must be production or preview, not "${flags.channel}".`);
  }
  const production = flags.channel === "production";
  checkTree({ requireMain: production, dryRun: flags.dryRun });
  runGates({ enabled: flags.gates, dryRun: flags.dryRun });

  const args = [
    ...EAS,
    "update",
    "--channel",
    flags.channel,
    "--environment",
    flags.channel,
    "--message",
    message,
    "--non-interactive",
    "--json",
  ];

  if (flags.dryRun) {
    step("Dry run: would publish");
    console.log(`  npx ${args.map(quote).join(" ")}`);
    console.log("\n✔ Dry run complete. Nothing was published.");
    return;
  }

  step(`Publishing OTA update to the ${flags.channel} channel`);
  const { status, stdout } = run("npx", args, { capture: true });
  if (status !== 0) fail("eas update failed. Nothing reached testers.");
  const parsed = parseJson(stdout);
  const updates = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  const group = updates[0]?.group;
  if (!group) {
    console.log(stdout);
    fail("The update published, but its group id could not be read from the CLI output. Check expo.dev.");
  }
  console.log("\n✔ Published.");
  console.log(`  Update group: ${group}`);
  console.log(`  Channel:      ${flags.channel}`);
  console.log(`  Platforms:    ${[...new Set(updates.map((u) => u.platform))].join(", ")}`);
  console.log(`  Roll back:    npx eas-cli@latest update:rollback ${group} --non-interactive`);
}

function releaseNative({ flags }) {
  checkTree({ requireMain: true, dryRun: flags.dryRun });
  runGates({ enabled: flags.gates, dryRun: flags.dryRun });

  const ios = [
    ...EAS,
    "build",
    "--platform",
    "ios",
    "--profile",
    "production",
    "--auto-submit",
    "--no-wait",
    "--non-interactive",
    "--json",
  ];
  const android = [
    ...EAS,
    "build",
    "--platform",
    "android",
    "--profile",
    "preview",
    "--no-wait",
    "--non-interactive",
    "--json",
  ];

  if (flags.dryRun) {
    step("Dry run: would start");
    console.log(`  npx ${ios.map(quote).join(" ")}`);
    console.log(`  npx ${android.map(quote).join(" ")}`);
    console.log("\n✔ Dry run complete. No build was started.");
    return;
  }

  const started = [];
  for (const [label, args] of [
    ["iOS production build (auto-submits to TestFlight)", ios],
    ["Android preview build (installable APK)", android],
  ]) {
    step(`Starting ${label}`);
    const { status, stdout } = run("npx", args, { capture: true });
    if (status !== 0) {
      console.error(`✖ ${label} did not start.`);
      started.push({ label, id: null, url: null });
      continue;
    }
    const parsed = parseJson(stdout);
    const build = Array.isArray(parsed) ? parsed[0] : parsed;
    started.push({ label, id: build?.id ?? null, url: build?.buildDetailsPageUrl ?? null });
  }

  console.log("\nBuilds:");
  for (const b of started) {
    console.log(`  ${b.id ? "✔" : "✖"} ${b.label}`);
    if (b.id) console.log(`      id:  ${b.id}\n      url: ${b.url ?? "(see expo.dev)"}`);
  }
  if (started.some((b) => !b.id)) fail("At least one build did not start. See the errors above.");
  console.log(
    "\nThe iOS build uploads to TestFlight on its own when it finishes. The Android APK link is on the build page.",
  );
}

function releaseCheck({ flags }) {
  checkTree({ requireMain: false });
  runGates({ enabled: true, dryRun: flags.dryRun });
}

const { command, flags, positional } = parseArgs(process.argv.slice(2));
const commands = { ota: releaseOta, native: releaseNative, check: releaseCheck };

if (!commands[command]) {
  console.error('Usage: node scripts/release.mjs <ota "message" | native | check> [--dry-run] [--channel production|preview]');
  process.exit(1);
}

if (!existsSync(resolve(root, "node_modules"))) fail("Run npm ci first.");
commands[command]({ flags, positional });
