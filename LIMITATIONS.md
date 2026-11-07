# Prototype limitations

This is a prototype. Everything below is deliberate scope, disclosed rather than hidden.

## Roles and state
- Roles are simulated. Anyone can press "Approve as Lena" or "Authorize as Robin"; there is no login. Separation of duties is enforced by actor names inside the page, not by identity.
- All state lives in one browser tab and is lost on reload. There is no backend, no persistence and no exportable audit log.
- Fingerprints use a short non-cryptographic hash. They show how approval binds to a revision; they are not tamper-proof.

## "AI" behaviour is deterministic rules
- Extraction splits by headings (or short heading-like lines, or paragraphs). It does not understand content.
- Conflict detection simulates AI classification: answer topics come from a keyword rule ("early refill", "refill too soon") or the unit's title, and a conflict is a published unit in the same topic for an audience that could see both. Near-duplicates are word overlap (Dice coefficient, threshold 0.45), a similarity measure only.
- The source-support check is narrow: Legal verbatim must match the excerpt exactly; guidance must not contain numbers that the source lacks. It would not catch a changed meaning without a number, such as "free shipping" becoming "paid shipping". A real system needs a model-based or human support check here.
- Search is keyword matching with a small synonym and misspelling list and a 75% coverage threshold. It is not semantic retrieval. Free-text questions work when their key words, or a listed synonym, appear in an approved unit; differently worded questions may get "no approved answer" even when the knowledge exists. A few drug names count toward a match but are never required. About forty typed questions are tested across the acceptance and free-text checks; many more phrasings would fail.
- The knowledge is tiny: one emergency bulletin (five units), three published documents (nine units) and, optionally, the Rx education script. Most questions will correctly get no approved answer.
- Situation (applicability) detection is keyword patterns: declared counties (hurricane, evacuated, flood, county names…), outside them ("not in a declared county"), mail-order and retail. A member's real address is never checked; the question decides, or the system asks.

## Governance policy choices
- An audience proposal leaves the current revision serving its current audience until authorized. Urgent narrowing of an audience (for example after a leak) is not modelled.
- Robin can authorize audiences in a batch for convenience; Legal approval is always one revision at a time.
- Only four gap clusters are predefined. Other empty searches are listed but cannot be drafted.
- Source changes are simulated for two cases: the bulletin's extension to November 15, and the Rx script's pricing section.
- The emergency does not expire on its own. When it ends, Nina would retire the bulletin units and restore the standing rule for everyone, each as a revision Robin approves; that step is not built.

## Evaluation
- Ten golden cases and eight regression scenarios. With only ten cases, treat the launch bar as all ten passing.
- The fixtures are written for the emergency bulletin and the published documents. Uploading your own documents, authorizing an audience change, or revising a source will make cases written for the old policy fail until a person updates the fixture. That is intended.
- Passing these checks shows the prototype behaves as specified on its fixtures. It is not evidence of production model quality.

## Presenter mode
- The speaker-notes tab links to the presentation over BroadcastChannel. This was verified with two tabs of the local file in Chromium; it has not been verified inside the claude.ai viewer. If the tabs don't link, the notes tab says so and its own Previous/Next buttons still work, and `RUN-OF-SHOW.md` is the fallback.
- The timer lives in the notes tab (and that browser's storage). It starts when the presentation leaves the title screen, or with Start timer.
- Each demo step acts through the governance engine as the named person (Lena, Robin or Nina), exactly as if you had pressed their button. Going back a step, Restart, or jumping to a beat rebuilds the state by replaying the script from a clean session, which discards anything you did by hand on that beat. Moving forward from one beat into the next keeps it.

## Other
- Word (.docx) reading loads mammoth 1.6.0 from cdnjs, so it needs a network connection. PDF is not supported.
- Unit IDs are stable for the two samples (bulletin KU-…-141 to 145, Rx script KU-…-101 to 105); other documents are numbered by upload order.
- All names, documents, wordings, figures and benefit claims are made up and illustrative. Hurricane Delia, the six counties, code EM-14 and every date are fictional. Lifting refill limits in a declared disaster mirrors a real Medicare Part D practice, but nothing here describes any plan's actual policy.
- `window.__KL` is a test hook used by `tests/acceptance.mjs`; it is not part of the product.
