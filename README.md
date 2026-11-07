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

## Key decisions
- **Units, not chunks.** A unit has one meaning, one owner, one source and one audience.
- **Approval binds to a revision.** Editing creates a new draft and withdraws the published revision.
- **Separation of duties.** The author can't approve their own unit.
- **Deterministic scoping before any model.** Who may see what is never left to a model.
- **Drift withholds.** An answer from a changed source is withheld rather than served.

## Run it
Open `knowledge-layer.html` in a browser. The first screen is a presentation; press **E** for the explore view. A recording is in `media/knowledge-layer-walkthrough.mp4`.

Tests: `npm i playwright`, then `node tests/acceptance.mjs` and `node tests/presenter.mjs`. Results are in [TEST-RESULTS.md](TEST-RESULTS.md).

## Limits
Read [LIMITATIONS.md](LIMITATIONS.md). In short: roles are simulated, state lives in one tab, and the "AI" is deterministic rules (keyword search, heading-based extraction). It shows the governance design, not production model quality.

## How it was made
I designed and directed this: the problem framing, the governance model and the decisions above. I built it with Claude Code.

Images: Microsoft Fluent Emoji 3D (MIT), licence in `assets/`.
