#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const home = homedir();

const targets = {
  "Claude Code": {
    src: join(__dirname, "stress-test.md"),
    dest: join(home, ".claude", "commands", "stress-test.md"),
  },
  Codex: {
    src: join(__dirname, "codex", "SKILL.md"),
    dest: join(home, ".codex", "skills", "stress-test", "SKILL.md"),
  },
};

let installed = 0;

for (const [name, { src, dest }] of Object.entries(targets)) {
  const parentDir = dirname(dest);
  if (existsSync(parentDir) || existsSync(dirname(parentDir))) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`  Installed for ${name}: ${dest}`);
    installed++;
  } else {
    console.log(`  Skipped ${name} (not installed)`);
  }
}

if (installed === 0) {
  console.log("\nNo supported agent frameworks found. You can manually copy:");
  console.log("  stress-test.md -> your agent's instructions directory");
} else {
  console.log(`\nInstalled for ${installed} framework${installed > 1 ? "s" : ""}.`);
  console.log("Run /stress-test in a conversation with a technical plan.");
}
