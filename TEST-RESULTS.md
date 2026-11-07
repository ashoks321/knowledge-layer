# Test results

Run: 2026-10-26, headless Chromium (Playwright), desktop 1440×900 and mobile 390×820, against `knowledge-layer.html` in this folder.

**131 of 131 checks passed. Remaining failures: none.**

- `tests/acceptance.mjs`: 91 checks on the governed workflow (the emergency bulletin, its conflict, approvals, the extension, gaps), role-based answers, member chat and free-text search in the Explore view, the Rx script as a second sample, Play the story, and the in-page golden set (10 cases) and regression scenarios (8).
- `tests/presenter.mjs`: 40 checks on presenter mode: the top bar and logo, the speaker-notes tab, stepping through the demo with → and ←, rebuilding beats, Restart and Play, the roadmap slide, and layout.

These checks prove the prototype behaves as specified on its own fixtures. They are not evidence of production model quality; see LIMITATIONS.md.

## Golden set (guided baseline)

| Result | Check | Detail |
|---|---|---|
| Pass | G1 answer | retrieval:✓ source:✓ legal:✓ exclusion:✓ |
| Pass | G2 answer | retrieval:✓ content:✓ source:✓ exclusion:✓ |
| Pass | G3 answer | retrieval:✓ content:✓ source:✓ permission:✓ exclusion:✓ |
| Pass | G4 clarify | clarify:✓ exclusion:✓ |
| Pass | G5 answer | retrieval:✓ content:✓ source:✓ exclusion:✓ |
| Pass | G6 answer | retrieval:✓ content:✓ source:✓ exclusion:✓ |
| Pass | G7 answer | retrieval:✓ content:✓ source:✓ exclusion:✓ |
| Pass | G8 scope | permission:✓ exclusion:✓ |
| Pass | G9 none | abstention:✓ exclusion:✓ |
| Pass | G10 answer | retrieval:✓ source:✓ legal:✓ exclusion:✓ |

## Regression scenarios

| Result | Check | Detail |
|---|---|---|
| Pass | R1 Editing approved content withdraws it and needs reapproval |  |
| Pass | R2 Broadening an audience needs Robin's authorization |  |
| Pass | R3 An extension withholds what changed and never falls back to the standing rule |  |
| Pass | R4 An exception that still overlaps the standing rule blocks publication |  |
| Pass | R5 Exception and standing rule coexist; an unclear question gets a question back |  |
| Pass | R6 Unsupported questions that share words with a supported topic |  |
| Pass | R7 A published unit whose wording no longer matches its approval |  |
| Pass | R8 A gap draft is not an answer until evidence and approval |  |

## §2 Approval integrity

| Result | Check | Detail |
|---|---|---|
| Pass | Before the edit: Priya gets the 30-day override |  |
| Pass | Edit creates a new draft revision r2, withheld |  |
| Pass | Card says who changed it and that it needs fresh approval |  |
| Pass | r1 keeps its approval; r2 has none | [{"r":1,"status":"withdrawn","by":"robin","cr":1},{"r":2,"status":"draft","by":null,"cr":null}] |
| Pass | Search withholds the changed text | Under review This answer is being revised. Nothing older is shown in its place. |
| Pass | Other units keep answering (Harold's member wording) |  |
| Pass | Handler rejects approval even if the button is forced on | Not supported by its source: “90” is not in the source |

## §3 Source support

| Result | Check | Detail |
|---|---|---|
| Pass | Source discrepancy exposed on the unit |  |
| Pass | Robin's approve button is disabled for the unsupported r2 |  |

## §6 Evaluation validity

| Result | Check | Detail |
|---|---|---|
| Pass | Golden set fails G2 after the bad edit | [{"id":"G2","pass":false,"kind":"held"}] |
| Pass | Golden set after the approved extension |  |

## §4 Audience governance

| Result | Check | Detail |
|---|---|---|
| Pass | Before authorization, the current audience keeps its answer (Ivan, r1) |  |
| Pass | Queue shows the proposed and the current audience, by revision | Lost or damaged medication → Pharmacy advocates + members (voice, chat) (now All advocates + members (chat, voice), r1) Authorize r2 |
| Pass | After authorization and publishing, Ivan no longer sees it |  |
| Pass | Priya gets r2, authorized by Robin |  |

## §5 Conflicts and drift

| Result | Check | Detail |
|---|---|---|
| Pass | An exception that still overlaps the standing rule is blocked, with the reason | Nina · authorPublish 0 readyNina authored these, so she cannot approve them. 2 not readyEarly refills: member statement: Conflicts with KU-RX-031: same answer t |
| Pass | AI flags the bulletin against the standing rule by topic, for two new units |  |
| Pass | Exception: in a declared county Priya gets the override |  |
| Pass | Exception: outside it she gets the standing rule r2 |  |
| Pass | Exception: a generic question asks which situation, no text |  |
| Pass | Extension: Harold's answer is withheld, with no fallback to “refill too soon” |  |
| Pass | Extension: the standing rule outside the area is unaffected |  |
| Pass | Extension: Ivan's unchanged guidance keeps serving |  |
| Pass | After approval, Harold gets the November 15 wording as r2 |  |
| Pass | Replace instead: the standing rule retires and the bulletin answers everyone |  |

## Citations

| Result | Check | Detail |
|---|---|---|
| Pass | Citation opens the cited source revision (v2, S1) with an exact-match verdict |  |

## §7 Gap handoff

| Result | Check | Detail |
|---|---|---|
| Pass | Unsupported question declines, with a system message |  |
| Pass | Cluster shows Draft in progress with a unit id |  |
| Pass | Draft is not served |  |
| Pass | Open the draft lands on it in Units with an evidence requirement |  |
| Pass | Approval blocked without evidence |  |
| Pass | With evidence: Awaiting approval |  |
| Pass | Same question now answered, citing the new unit and evidence |  |
| Pass | Gap shows Resolved by published knowledge |  |
| Pass | Fix the process records an owned task |  |

## Role-based answers

| Result | Check | Detail |
|---|---|---|
| Pass | All three: each person gets an answer, from a different unit | Same question, three approved answers. Each person gets only what their role and channel allow. |
| Pass | Only Priya sees the override code; Ivan is told to send the call to pharmacy |  |
| Pass | Banner explains the different answers |  |

## Member chat

| Result | Check | Detail |
|---|---|---|
| Pass | A generic question gets a question back before any answer |  |
| Pass | Answering Yes gives Legal's exact member wording |  |
| Pass | Harold types “I evacuated, can I refill my insulin early” → answer KU-SH-141 | answer |
| Pass | Harold types “lost my medication in the flood” → answer KU-SH-144 | answer |
| Pass | Harold types “how do I pay my premium” → answer KU-IN-022 | answer |
| Pass | Harold types “can I get extra medication for a trip” → answer KU-RX-032 | answer |
| Pass | Harold types “are drug prices final” → answer KU-RX-013 | answer |
| Pass | Harold types “which counties are covered” → answer KU-SH-145 | answer |
| Pass | Harold types “I don't live in an affected county, can I refill early?” → answer KU-RX-031 | answer |
| Pass | Harold types “replace oxygen tank” → none | none |
| Pass | Harold types “hurricane damage to my house” → none | none |

## Free-text search

| Result | Check | Detail |
|---|---|---|
| Pass | Pharmacy advocate types “member evacuated, needs an early refill” → answer KU-RX-142 | answer |
| Pass | Pharmacy advocate types “refill too soon” → clarify | clarify |
| Pass | Pharmacy advocate types “lost medication” → answer KU-SH-144 | answer |
| Pass | Pharmacy advocate types “Rx pricing disclaimer” → answer KU-RX-013 | answer |
| Pass | Insurance advocate types “EM-14 override code” → scope | scope |
| Pass | Insurance advocate types “which counties are declared” → answer KU-SH-145 | answer |
| Pass | Insurance advocate types “where is my claim” → answer KU-IN-023 | answer |
| Pass | Insurance advocate types “how do I pay my premium” → answer KU-IN-022 | answer |
| Pass | Pharmacy advocate types “what's the weather today” → none | none |
| Pass | Insurance advocate types “flood insurance claim” → none | none |

## Rx script sample

| Result | Check | Detail |
|---|---|---|
| Pass | The pricing disclaimer is flagged against the 2024 wording, with its word overlap | Conflict Same answer topic, different instructions AI classification, not a judgement of which is right · 74% word overl |
| Pass | Merged: Priya gets the v3 disclaimer, read exactly |  |
| Pass | Lena's revision withholds it, with no 2024 fallback |  |
| Pass | After Lena approves r2, the v4 wording is served |  |

## §8 Guided vs manual

| Result | Check | Detail |
|---|---|---|
| Pass | Guided scroll loads the search step with a labelled sample |  |
| Pass | Guided approvals are labelled as the pre-approved sample, not a person |  |
| Pass | Manual scrolling never extracts, approves or publishes | {"mode":"manual","units":0,"approved":false} |
| Pass | Reset restores the starting state | {"mode":"guided","step":-1,"units":0} |

## §13 Precision

| Result | Check | Detail |
|---|---|---|
| Pass | No AI confidence percentages; the conflict is labelled a classification, not a judgement |  |

## Play the story

| Result | Check | Detail |
|---|---|---|
| Pass | Explore's self-running story reaches the end, with every golden case passing | 10/10 |

## Layout

| Result | Check | Detail |
|---|---|---|
| Pass | Mobile: no horizontal scroll |  |
| Pass | Mobile: Show me opens the prototype sheet |  |
| Pass | Desktop: no horizontal scroll |  |

## Console

| Result | Check | Detail |
|---|---|---|
| Pass | No page errors |  |

## Presenter mode

| Result | Check | Detail |
|---|---|---|
| Pass | Opens in presenter mode on the title screen | {"view":"present","screen":"title","k":0,"appIn":false,"cap":"","spot":false} |
| Pass | Top bar: the logo and Speaker notes only, with no repeated product name | {"btns":["Knowledge Layer: back to the first screen","Speaker notes ↗"],"word":false} |
| Pass | → opens the cold open on its first step, with a caption and a spotlight | {"view":"present","screen":"cold","k":0,"appIn":true,"cap":"Priya is on a live call.","spot":true} |
| Pass | → inside a beat performs the next step (Priya's search shows three wordings) |  |
| Pass | After the last step, → moves on and parks the prototype |  |
| Pass | Notes tab links and follows the current screen | Knowledge Layer · speaker notes Following the presentation PROBLEM · SCREEN 3 OF 19 One disclaimer, three wordings Targe |
| Pass | Notes tab Next drives the presentation | who |
| Pass | Notes show target time and a running timer |  |
| Pass | Beat 1 starts a clean session on its first step | {"view":"present","screen":"bulletin","k":0,"appIn":true,"cap":"6 pm: an emergency bulletin reaches Nina.","spot":true} |
| Pass | Notes list the beat's steps and follow the current one | Knowledge Layer · speaker notes
Following the presentation
L |
| Pass | Step 2: AI splits the bulletin into five units |  |
| Pass | Step 4: Nina's decision is applied (an exception) |  |
| Pass | ← goes back one step and rebuilds that state exactly |  |
| Pass | → from the last step continues into beat 2 with the same state |  |
| Pass | Beat 2's steps approve as Lena and Robin, then Nina publishes | 5 published |
| Pass | Approvals are recorded against the named people | lena/robin |
| Pass | Beat 3: Harold gets Legal's exact wording in member chat | If you live in a county affected by Hurricane Delia, you can |
| Pass | Beat 3: All three shows three different approved answers |  |
| Pass | Beat 3: an unclear question gets a question back |  |
| Pass | The prototype stays live between steps (answering Yes gives the answer) |  |
| Pass | Arrow keys inside the search box don't change steps |  |
| Pass | Jumping to a beat rebuilds its state from the script |  |
| Pass | Extension step: Harold is told it's being updated, never the standing rule |  |
| Pass | Trust step 2 breaks the override: two golden cases fail | G2,G8 |
| Pass | Trust step 3 restores it: every golden case passes | 10/10 |
| Pass | Restart returns to the beat's first step |  |
| Pass | Play steps through the beat on its own | {"view":"present","screen":"trust","k":2,"appIn":true,"cap":"Restore, re-approve, publish: ten of ten.","spot":true} |
| Pass | Roadmap slide: four phases, one line each and an exit | 84 words |
| Pass | ← onto a beat lands on its last step |  |
| Pass | O opens all screens |  |
| Pass | Esc closes it |  |
| Pass | A jumps to the Q&A appendix |  |
| Pass | A question jumps to the screen that answers it |  |
| Pass | Journey chip jumps to the matching demo step | {"view":"present","screen":"bulletin","k":2,"appIn":true,"cap":"AI flags a clash with the refill rule.","spot":true} |
| Pass | E switches to Explore with the app back in its place |  |
| Pass | From Explore, the logo returns to the first screen | {"view":"present","screen":"title","k":0,"appIn":false,"cap":"","spot":false} |
| Pass | The logo returns to the first screen |  |
| Pass | No screen scrolls sideways at 1440×900 |  |
| Pass | No screen scrolls sideways on a phone |  |
| Pass | No page errors |  |
