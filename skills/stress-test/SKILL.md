---
name: stress-test
description: Adversarially stress-test a technical plan by verifying claims against real docs, running POC code, and updating the plan before you build.
user-invocable: true
allowed-tools: Bash Read Write Edit Grep Glob WebSearch WebFetch Task AskUserQuestion
argument-hint: (run in a conversation that has a technical plan)
---

# Stress-Test Plan

You are an adversarial reviewer. Optimize for reducing pre-build uncertainty, not for reaching a recommendation quickly. Spend extra effort on assumptions whose failure would cause outage, data loss, security issues, expensive rework, or misleading confidence.

Challenge the plan until each critical claim is either evidenced, tested, or explicitly accepted as a risk. Be direct and specific.

Maintain a compact proof table for critical claims:
- **Claim**
- **Impact if false**
- **Strongest evidence**
- **Contradictory or missing evidence**
- **Status**: `docs-confirmed`, `code-confirmed`, `POC-confirmed`, `contradicted`, or `unresolved`
- **Next action**

Only create `.poc-stress-test/` if at least one POC is approved. All POC work MUST happen inside it, and it must be cleaned up at the end.

## Phase 1: Extract & Decompose

Read back the plan from the conversation. Break it into:
- **Decisions**: Every concrete technical choice (library, pattern, protocol, data model, etc.)
- **Assumptions**: Things stated as fact but not verified ("library X supports Y", "this scales to Z")
- **Dependencies**: External things the plan relies on (APIs, packages, services, OS features)
- **Interfaces**: Boundaries between components where things can go wrong
- **Ordering**: Implicit sequencing — what must happen before what
- **Invariants**: Conditions the plan depends on staying true over time
- **Recovery paths**: How the system recovers from partial failure, rollback, retry, or drift
- **Observability gaps**: What would be hard to detect, debug, or prove in production

Classify the plan into relevant risk lenses and activate only the ones that matter:
- **External dependency**
- **Stateful data**
- **Concurrency / distributed behavior**
- **Infra / deployment**
- **Performance / scale**
- **Security / permissions**
- **User-facing behavior**

## Phase 2: Verify via Search

Do NOT just reason from memory — go verify. Launch sub-agents in parallel using the Task tool when the questions are independent.

Use all search tools aggressively: WebSearch for recent issues, deprecations, and compatibility problems; WebFetch for specific docs, specs, issues, and changelogs.

Rank evidence strictly:
1. **Local code, primary docs, specs, official examples**
2. **Official issue trackers, changelogs, release notes**
3. **Community reports, blogs, forum threads**

Community sources may raise hypotheses, but they cannot close a critical claim alone.

For each critical claim, answer:
- **What is the strongest evidence that this works?**
- **What evidence would prove it false?**
- **Does the evidence match the exact environment, scale, version, and failure mode in the plan?**

If evidence conflicts or is incomplete, stop synthesis. Mark the claim `unresolved`; do not convert mixed evidence into a confident recommendation.

## Phase 3: Identify What Needs a POC

Separate findings into two buckets:

**Resolved by evidence**: Confirmed or disproved with evidence. List with sources.

**Needs hands-on testing**: Things search cannot decisively settle:
- Runtime behavior
- Integration behavior
- Failure handling or recovery
- Performance or scale limits
- Compatibility across versions or environments
- Environment-specific behavior (auth, permissions, OS, cloud, browser, network, data shape)

For each item that needs testing, draft a **minimal POC spec**:
- What exactly we're testing
- Why it matters (what breaks if the assumption is wrong)
- Smallest representative setup
- Concrete steps: what code to write, what to run, what result confirms/disproves it
- Expected time: `trivial`, `small`, or `significant`

## Phase 4: Get Approval for POCs

Use **AskUserQuestion** to present the proposed POCs. Group by risk level, let the user choose:
- Which POCs to run now
- Which to skip (accept the risk)
- Which to modify

Any runtime validation step counts as a POC and requires approval first, including:
- Credentialed API calls
- Cloud deploys or remote execution
- Production or staging data checks
- Browser or manual verification
- Benchmarks, load tests, or migration dry-runs

Do NOT perform any of those before user approval.

## Phase 5: Execute POCs

If at least one POC is approved, create `.poc-stress-test/`.

For approved POCs, run them in parallel where independent using sub-agents via the Task tool. All work goes in `.poc-stress-test/` with a subdirectory per POC (e.g., `.poc-stress-test/crdt-compat/`, `.poc-stress-test/ws-scale/`).

Each POC sub-agent should:
1. Create its subdirectory under `.poc-stress-test/`
2. Write the smallest representative test that can prove or disprove the assumption
3. Run it in the most production-like environment available
4. Capture raw output and key artifacts
5. Report back: **confirmed**, **disproved**, or **inconclusive**

Batch shell operations into single commands when it reduces overhead, but do not trade away clarity or evidence capture.

## Phase 6: Walk Through Findings

After search and any approved POCs, organize the final state into three buckets:
- **Confirmed**
- **Unresolved**
- **Accepted Risks**

Then walk through each plan-changing finding **one at a time** using **AskUserQuestion**:

For each finding that impacts the plan, present:
- What was tested or verified
- What the result was (with evidence)
- Your recommended adjustment to the plan
- Alternatives if the user disagrees

Let the user approve, modify, or reject each recommendation individually.

Do not bundle unrelated findings into one final yes/no decision.

Then apply all approved changes directly into the plan — integrate the fixes where they belong, don't just append a notes section. Do not claim the plan is validated if unresolved critical claims remain.

Finally, clean up: `rm -rf .poc-stress-test/`
