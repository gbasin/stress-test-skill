# stress-test-skill

An agent skill that stress-tests technical plans before you build them.

Models are lazy about verification. They'll write a plan that says "use SQLite for concurrent writes" or "Y.js supports persistence out of the box" and move on without checking. These unchecked assumptions become mid-build surprises that force architectural pivots, messy workarounds, and wasted context.

This skill forces the model to actually verify its claims — searching real docs, running proof-of-concept code, and fixing the plan before implementation starts. Each verification runs in a fresh sub-agent context, so there's no confirmation bias from the planning conversation. The result: plans that work on the first try, which means cleaner code with fewer mid-course corrections.

## Example

You've been planning a real-time collaborative editor. Your plan assumes "SQLite handles concurrent writes fine" and "Y.js has built-in persistence." You run the skill:

```
Phase 1 — Decomposed plan into 14 decisions, 9 assumptions, 6 dependencies

Phase 2 — Launching 4 verification agents in parallel...

  CONFIRMED  CodeMirror 6 supports custom extensions (docs.codemirror.net)
  DISPROVED  "SQLite handles concurrent writes" — WAL mode caps at ~50 write TPS
  DISPROVED  "Y.js has built-in persistence" — requires y-indexeddb or custom provider
  CONFIRMED  diff-match-patch handles UTF-8 (google/diff-match-patch#113)
  UNCERTAIN  WebRTC data channel reliability on mobile — mixed reports, needs testing

Phase 3 — Triage: 7/9 assumptions resolved by search. 2 need POCs:
  1. CRDT sync accuracy under rapid concurrent edits (est. 10 min)
  2. WebRTC reconnection latency on mobile (est. 15 min)

Phase 4 — [asks which POCs to run]

Phase 5 — Running approved POCs in .poc-stress-test/...
  crdt-sync/   CONFIRMED  Y.Text merges correctly at 100 edits/sec
  webrtc-test/ DISPROVED  reconnection takes 8-12s, not <1s as planned

Phase 6 — Walking through findings one at a time...
  Recommendation: Replace SQLite with PostgreSQL for relay server
  Recommendation: Add reconnection UI state, adjust SLA from <1s to <15s
  [applies approved changes directly into your plan]
```

Caught two false assumptions — one from docs, one from running code.

## Install

### Claude Code

```
/plugin marketplace add gbasin/stress-test-skill
/plugin install stress-test
```

Or manually:

```bash
curl -fsSL -o ~/.claude/commands/stress-test.md \
  https://raw.githubusercontent.com/gbasin/stress-test-skill/main/stress-test.md
```

### Codex

```
$skill-installer install https://github.com/gbasin/stress-test-skill/tree/main/skills/stress-test
```

Or manually:

```bash
mkdir -p ~/.codex/skills/stress-test
curl -fsSL -o ~/.codex/skills/stress-test/SKILL.md \
  https://raw.githubusercontent.com/gbasin/stress-test-skill/main/skills/stress-test/SKILL.md
```

### Other agent frameworks

Copy `stress-test.md` into wherever your framework reads agent instructions from, or include its contents in your agent's system prompt.

## How it works

Six phases, each building on the last:

1. **Decompose** — Extracts every decision, assumption, dependency, and interface from your plan
2. **Verify** — Launches parallel sub-agents to search docs, repos, and the web for evidence. For each claim: *"How do we know this works?"*
3. **Triage** — Separates what's confirmed from what needs hands-on testing. Drafts minimal POC specs for unresolved items.
4. **Approve** — Presents proposed POCs and lets you choose which to run, skip, or modify. Nothing runs without your say-so.
5. **Test** — Runs approved POCs in parallel in an isolated `.poc-stress-test/` directory. Each POC reports confirmed, disproved, or inconclusive with raw output.
6. **Update** — Walks through each finding individually, recommends plan changes, and applies approved updates inline. Cleans up after itself.

## When to use it

- After writing a technical plan or architecture doc, before you start building
- When evaluating a new library, framework, or integration approach
- Before committing to decisions that are expensive to reverse
- Anytime a plan has claims you haven't personally verified

## License

[MIT](LICENSE)
