# Knowledge Layer

Governed, cited knowledge under every AI channel.

**Thesis: search is the exhaust of governance.** AI search over raw documents returns whatever matches, including stale, superseded and out-of-scope guidance. A better index doesn't fix that. The fix is to govern the knowledge first, so that every answer is already approved, cited and scoped to the person asking.

## The problem
A pharmacy advocate, an insurance advocate and a member chatbot all answer the same question from different documents. The wording drifts, old guidance outlives new guidance, and nobody can say which version an answer came from.

## What it does
The prototype follows a fictional hurricane (Hurricane Delia). An emergency bulletin arrives and conflicts with a standing refill rule.
1. Break the bulletin into **units** (one answerable statement each), not chunks.
2. A named author drafts, Legal approves wording, and a governance lead authorizes audiences. Approvals bind to the **exact revision** by fingerprint.
3. Search filters by role and channel first, then ranks. Hard filters run before ranking.
4. When a source changes (the emergency is extended), affected units are withheld, with no fallback to stale text.
5. Empty searches become documented gaps, and gap drafts are real units that need evidence.
6. A golden set (10 cases) and regression scenarios (8) test the content, not just the code.
7. Free-text questions are read by a real model (see below), but the model never writes the answer.

## Key decisions
- **Units, not chunks.** A unit has one meaning, one owner, one source and one audience.
- **Approval binds to a revision.** Editing creates a new draft and withdraws the published revision.
- **Separation of duties.** The author can't approve their own unit.
- **Deterministic scoping before any model.** Who may see what is never left to a model.
- **Drift withholds.** An answer from a changed source is withheld rather than served.

## Where the AI model is used
Claude reads the question. Rules decide what may be served.
- **What Claude does:** on the *Try it live* screen, one model call per question picks the matching approved unit and the person's stated situation (for example, "evacuated, in a declared county"). Only the units that role may see go into the prompt.
- **What it never does:** write the answer. The approved text is served by the rules engine, which enforces scope, approval and drift. If the call fails or declines, keyword rules answer instead.
- **Where it runs:** the hosted claude.ai version, using claude.ai's model tier. Opened locally or on another host, the page runs on rules only, and a top-bar pill says which mode you are in.

### Live evals
- **In the page:** *Score Claude on the golden set* makes 10 fresh model calls (no cache) and shows rules versus Claude for each case, with a timestamp.
- **Offline run, 2026-11-06, Claude Haiku 5.5 through the local CLI:** golden set 10/10 in each of 3 runs. On 20 free-text probes, Claude matched 20/20 and the keyword rules 12/20.
- **Read these numbers with care:** the prompt was tuned after I saw golden-set failures, so 10/10 is partly fitted. The 20 probes are a small set. The offline run used Haiku 5.5, not the hosted tier, and has not been repeated inside the claude.ai viewer.

## Run it
Open `knowledge-layer.html` in a browser. The first screen is a presentation; press **E** for the explore view and **T** for *Try it live*. A recording of the scripted demo is in `media/knowledge-layer-walkthrough.mp4`. The scripted demo and the in-page golden set use rules, so they behave the same everywhere.

## Limits
Read [LIMITATIONS.md](LIMITATIONS.md). In short: roles are simulated, state lives in one tab, and extraction and retrieval are deterministic rules. The model is used only to read free-text questions. This shows the governance design, not production model quality. The earlier browser test suite targeted an older build and is not included.

## How it was made
I designed and directed this: the problem framing, the governance model and the decisions above. I built it with Claude Code, and the live question-reading uses Claude.

Images: Microsoft Fluent Emoji 3D (MIT), licence in `assets/`.
