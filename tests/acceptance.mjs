import { chromium } from "playwright";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.resolve(here, "../knowledge-layer.html") + "#explore";
const results = []; const errs = [];
const T = (group, name, pass, detail = "") => { results.push({ group, name, pass: !!pass, detail }); console.log(`${pass ? "PASS" : "FAIL"} [${group}] ${name}${detail ? " — " + detail : ""}`); };
const b = await chromium.launch();
async function page(vw = { width: 1440, height: 900 }) { const p = await b.newPage({ viewport: vw }); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/knowledge-layer-walkthrough/.test(m.text())) errs.push(m.text()); }); await p.goto(url); await p.waitForLoadState("networkidle"); return p; }
const A = (p, act, x, u) => p.click(`#app [data-act="${act}"]${x !== undefined ? `[data-x="${x}"]` : ""}${u ? `[data-u="${u}"]` : ""}`);
const EVAC = "I evacuated, can I refill my insulin early", PRIYA_IN = "early refill, member evacuated", PRIYA_OUT = "early refill, member not in a declared county";
const ROLE_NAME = { pharmacy: "Pharmacy advocate", insurance: "Insurance advocate", member: "Member chat" };
const ask = async (p, q, role, cmp = "off") => { await A(p, "goto", 3); await A(p, "cmp", cmp); if (cmp === "off") await A(p, "role", role); await p.fill("#q", q); await p.press("#q", "Enter"); await p.waitForTimeout(80);
  return p.evaluate(() => [...document.querySelectorAll("#res .ans")].map(a => ({ kind: a.dataset.kind, role: a.dataset.role, text: a.querySelector(".ans-b").innerText }))); };
// Manual session: Nina adds the bulletin, decides the conflict, Lena and Robin approve, Nina publishes.
async function manualPublish(p, decision = "exception") {
  await A(p, "manual"); await A(p, "sample"); await A(p, "extract");
  if (Array.isArray(decision)) { await A(p, "cf-open", undefined, "KU-RX-031"); await p.selectOption("#cfn-KU-RX-031", decision[0]); await p.selectOption("#cfo-KU-RX-031", decision[1]); await A(p, "cf-apply", undefined, "KU-RX-031"); }
  else await A(p, "cf", decision, "KU-RX-031");
  await approveAndPublish(p);
}
async function approveAndPublish(p) {
  await A(p, "goto", 2);
  for (const who of ["lena", "robin"]) for (let i = 0; i < 8; i++) { const x = p.locator(`#app [data-act="approve"][data-x="${who}"]:not([disabled])`).first(); if (await x.count()) await x.click(); else break; }
  if (await p.locator('#app [data-act="authorize-all"]').count()) await A(p, "authorize-all");
  if (await p.locator('#app [data-act="publish"]:not([disabled])').count()) await A(p, "publish");
}

// ---------- In-page fixtures ----------
{ const p = await page();
  await p.evaluate(() => { location.hash = "search"; }); await p.waitForTimeout(200);
  const gold = await p.evaluate(() => window.__KL.runGolden().map(x => ({ id: x.g.id, pass: x.pass, c: x.c, kind: x.res.kind })));
  gold.forEach(x => T("Golden set (guided baseline)", `${x.id} ${x.kind}`, x.pass, Object.entries(x.c).map(([k, v]) => `${k}:${v ? "✓" : "✗"}`).join(" ")));
  const reg = await p.evaluate(() => window.__KL.runRegression());
  reg.forEach(r => T("Regression scenarios", `${r.id} ${r.title}`, r.pass, r.checks.filter(c => !c.pass).map(c => c.name).join("; ")));
  fs.writeFileSync("reg.json", JSON.stringify({ gold, reg }, null, 1)); await p.close(); }

// ---------- §2 + §3 approval bound to revision; source discrepancy (UI) ----------
{ const p = await page(); await manualPublish(p);
  let r = await ask(p, PRIYA_IN, "pharmacy");
  T("§2 Approval integrity", "Before the edit: Priya gets the 30-day override", r[0].kind === "answer" && /30-day supply/.test(r[0].text));
  await A(p, "goto", 1); await p.click('#app [data-act="edit-open"][data-u="KU-RX-142"]');
  const t = await p.inputValue("#ed-KU-RX-142"); await p.fill("#ed-KU-RX-142", t.replace("30-day", "90-day")); await p.fill("#er-KU-RX-142", "Reviewer test"); await p.click('#app [data-act="edit-save"][data-u="KU-RX-142"]');
  const card = await p.locator('[data-card="KU-RX-142"]').innerText();
  T("§2 Approval integrity", "Edit creates a new draft revision r2, withheld", /Withheld/.test(card) && /r2 awaiting approval/.test(card));
  T("§2 Approval integrity", "Card says who changed it and that it needs fresh approval", /r2 by Nina/.test(card) && /Reviewer test/.test(card) && /Needs fresh approval; r1 is withheld/.test(card));
  T("§3 Source support", "Source discrepancy exposed on the unit", /“90” is not in the source/.test(card));
  const hist = await p.evaluate(() => window.__KL.state().units.find(u => u.id === "KU-RX-142").revs.map(r => ({ r: r.r, status: r.status, by: r.content && r.content.by, cr: r.content && r.content.r })));
  T("§2 Approval integrity", "r1 keeps its approval; r2 has none", hist[0].status === "withdrawn" && hist[0].by === "robin" && hist[0].cr === 1 && !hist[1].by, JSON.stringify(hist));
  r = await ask(p, PRIYA_IN, "pharmacy");
  T("§2 Approval integrity", "Search withholds the changed text", r[0].kind === "held" && !/90-day/.test(r[0].text) && !/30-day/.test(r[0].text), r[0].text.replace(/\s+/g, " ").slice(0, 90));
  r = await ask(p, EVAC, "member");
  T("§2 Approval integrity", "Other units keep answering (Harold's member wording)", r[0].kind === "answer" && /KU-SH-141/.test(r[0].text));
  await A(p, "goto", 2);
  const btn = p.locator('#app [data-act="approve"][data-u="KU-RX-142"]'); T("§3 Source support", "Robin's approve button is disabled for the unsupported r2", await btn.isDisabled());
  await p.evaluate(() => { const b = document.querySelector('#app [data-act="approve"][data-u="KU-RX-142"]'); b.disabled = false; b.click(); });
  const toast = await p.locator('#app [role="alert"]').innerText().catch(() => "");
  T("§2 Approval integrity", "Handler rejects approval even if the button is forced on", /Not supported by its source/.test(toast), toast);
  const g = await p.evaluate(() => window.__KL.runGolden().filter(x => x.g.id === "G2").map(x => ({ id: x.g.id, pass: x.pass, kind: x.res.kind })));
  T("§6 Evaluation validity", "Golden set fails G2 after the bad edit", g.every(x => !x.pass), JSON.stringify(g));
  await p.close(); }

// ---------- §4 audience governance (UI) ----------
{ const p = await page(); await manualPublish(p);
  await A(p, "goto", 1); await p.click('#app [data-act="aud-open"][data-u="KU-SH-144"]'); await p.selectOption("#ak-KU-SH-144", "Pharmacy"); await p.click('#app [data-act="aud-save"][data-u="KU-SH-144"]');
  let r = await ask(p, "lost medication", "insurance");
  T("§4 Audience governance", "Before authorization, the current audience keeps its answer (Ivan, r1)", r[0].kind === "answer" && /KU-SH-144 r1/.test(r[0].text));
  await A(p, "goto", 2); const q = await p.locator('[data-aud="KU-SH-144"]').innerText();
  T("§4 Audience governance", "Queue shows the proposed and the current audience, by revision", /Pharmacy advocates/.test(q) && /now All advocates/.test(q) && /r1/.test(q) && /Authorize r2/.test(q), q.replace(/\s+/g, " "));
  await p.click('#app [data-act="authorize"][data-u="KU-SH-144"]'); await A(p, "publish");
  r = await ask(p, "lost medication", "insurance");
  T("§4 Audience governance", "After authorization and publishing, Ivan no longer sees it", r[0].kind === "scope" && !/proof of loss/.test(r[0].text));
  r = await ask(p, "lost medication", "pharmacy");
  T("§4 Audience governance", "Priya gets r2, authorized by Robin", r[0].kind === "answer" && /KU-SH-144 r2/.test(r[0].text) && /audience by Robin|Approved by Robin/.test(r[0].text));
  await p.close(); }

// ---------- §5 conflicts, exception and drift (UI) ----------
{ const p = await page(); await manualPublish(p, ["declared", "all"]);
  await A(p, "goto", 2); const pub = await p.locator(".pubpanel").evaluate(e => e.textContent);
  T("§5 Conflicts and drift", "An exception that still overlaps the standing rule is blocked, with the reason", /Early refill override.*Conflicts with KU-RX-031/s.test(pub), pub.replace(/\s+/g, " ").slice(0, 160));
  await p.close(); }
{ const p = await page(); await A(p, "manual"); await A(p, "sample"); await A(p, "extract");
  const cf = await p.locator(".conflict").innerText();
  T("§5 Conflicts and drift", "AI flags the bulletin against the standing rule by topic, for two new units", /Same answer topic/.test(cf) && /Early refills: member statement/.test(cf) && /Early refill override/.test(cf) && !/Early refill calls to Insurance/.test(cf));
  await A(p, "cf", "exception", "KU-RX-031"); await approveAndPublish(p);
  let r = await ask(p, PRIYA_IN, "pharmacy"); T("§5 Conflicts and drift", "Exception: in a declared county Priya gets the override", r[0].kind === "answer" && /KU-RX-142/.test(r[0].text));
  r = await ask(p, PRIYA_OUT, "pharmacy"); T("§5 Conflicts and drift", "Exception: outside it she gets the standing rule r2", r[0].kind === "answer" && /KU-RX-031 r2/.test(r[0].text));
  r = await ask(p, "refill too soon", "pharmacy"); T("§5 Conflicts and drift", "Exception: a generic question asks which situation, no text", r[0].kind === "clarify" && !/75%/.test(r[0].text) && !/EM-14/.test(r[0].text));
  await A(p, "goto", 4); await A(p, "extend");
  r = await ask(p, EVAC, "member"); T("§5 Conflicts and drift", "Extension: Harold's answer is withheld, with no fallback to “refill too soon”", r[0].kind === "held" && !/refill too soon|75%/.test(r[0].text) && /being updated/.test(r[0].text));
  r = await ask(p, PRIYA_OUT, "pharmacy"); T("§5 Conflicts and drift", "Extension: the standing rule outside the area is unaffected", r[0].kind === "answer" && /KU-RX-031/.test(r[0].text));
  r = await ask(p, "early refill hurricane", "insurance"); T("§5 Conflicts and drift", "Extension: Ivan's unchanged guidance keeps serving", r[0].kind === "answer" && /KU-IN-143 r1/.test(r[0].text));
  await A(p, "goto", 4);
  for (let i = 0; i < 6; i++) { const x = p.locator('#app .affected [data-act="approve"]:not([disabled])').first(); if (await x.count()) await x.click(); else break; }
  for (let i = 0; i < 6; i++) { const x = p.locator('#app .affected [data-act="authorize"]').first(); if (await x.count()) await x.click(); else break; }
  await p.click('#app .affected [data-act="publish"]');
  r = await ask(p, EVAC, "member"); T("§5 Conflicts and drift", "After approval, Harold gets the November 15 wording as r2", r[0].kind === "answer" && /November 15, 2026/.test(r[0].text) && /KU-SH-141 r2/.test(r[0].text));
  await p.click('#res [data-act="src"]'); const box = await p.locator("#srcBox").innerText();
  T("Citations", "Citation opens the cited source revision (v2, S1) with an exact-match verdict", /v2 \(current\)/.test(box) && /S1/.test(box) && /Matches the source exactly/.test(box));
  await p.click("#srcBox .x");
  const gold = await p.evaluate(() => window.__KL.runGolden()); T("§6 Evaluation validity", "Golden set after the approved extension", gold.every(x => x.pass), gold.filter(x => !x.pass).map(x => x.g.id).join(","));
  await p.close(); }
{ const p = await page(); await manualPublish(p, "merge");
  const st = await p.evaluate(() => window.__KL.state().units.find(u => u.id === "KU-RX-031").retired);
  const r = await ask(p, PRIYA_OUT, "pharmacy");
  T("§5 Conflicts and drift", "Replace instead: the standing rule retires and the bulletin answers everyone", st && r[0].kind === "answer" && /KU-RX-142/.test(r[0].text));
  await p.close(); }

// ---------- §7 gap to review handoff (UI) ----------
{ const p = await page(); await manualPublish(p);
  let r = await ask(p, "replace oxygen tank", "member"); T("§7 Gap handoff", "Unsupported question declines, with a system message", r[0].kind === "none" && /I don't have an approved answer/.test(r[0].text));
  await A(p, "goto", 5); await p.click('#app [data-act="gap-write"][data-x="dme"]');
  let c = await p.locator('[data-gap="dme"]').innerText(); T("§7 Gap handoff", "Cluster shows Draft in progress with a unit id", /Draft in progress/.test(c) && /KU-IN-301/.test(c));
  r = await ask(p, "replace oxygen tank", "member"); T("§7 Gap handoff", "Draft is not served", r[0].kind === "unapproved" && !/oxygen supplies/.test(r[0].text));
  await A(p, "goto", 5); await p.click('#app [data-act="gap-open"][data-x="dme"]');
  const card = await p.locator('[data-card="KU-IN-301"]').innerText(); T("§7 Gap handoff", "Open the draft lands on it in Units with an evidence requirement", /Supporting evidence required/.test(card) && /No source evidence/.test(card));
  await A(p, "goto", 2); const dis = await p.locator('#app [data-act="approve"][data-u="KU-IN-301"]').isDisabled(); T("§7 Gap handoff", "Approval blocked without evidence", dis);
  await A(p, "goto", 1); await p.click('#app [data-act="ev-sample"][data-u="KU-IN-301"]'); await p.click('#app [data-act="ev-save"][data-u="KU-IN-301"]');
  await A(p, "goto", 5); c = await p.locator('[data-gap="dme"]').innerText(); T("§7 Gap handoff", "With evidence: Awaiting approval", /Awaiting approval/.test(c));
  await A(p, "goto", 2); await p.click('#app [data-act="approve"][data-u="KU-IN-301"]'); await p.click('#app [data-act="authorize"][data-u="KU-IN-301"]'); await A(p, "publish");
  r = await ask(p, "replace oxygen tank", "member"); T("§7 Gap handoff", "Same question now answered, citing the new unit and evidence", r[0].kind === "answer" && /KU-IN-301 r1/.test(r[0].text) && /Medical Equipment Emergency Guidance/.test(r[0].text));
  await A(p, "goto", 5); c = await p.locator('[data-gap="dme"]').innerText(); T("§7 Gap handoff", "Gap shows Resolved by published knowledge", /Resolved by published knowledge/.test(c));
  await p.click('#app [data-act="gap-proc-open"][data-x="open"]'); await p.click('#app [data-act="gap-proc-sample"][data-x="open"]'); await p.click('#app [data-act="gap-proc-save"][data-x="open"]');
  c = await p.locator('[data-gap="open"]').innerText(); T("§7 Gap handoff", "Fix the process records an owned task", /Routed to a process fix/.test(c) && /PT-1/.test(c) && /Pharmacy operations/.test(c));
  await p.close(); }

// ---------- Role-based answers, member chat and free-text search ----------
{ const p = await page(); await manualPublish(p);
  let r = await ask(p, EVAC, null, "all");
  const banner = await p.locator("#res .banner").innerText().catch(() => "");
  const by = Object.fromEntries(r.map(x => [x.role, x]));
  T("Role-based answers", "All three: each person gets an answer, from a different unit", r.length === 3 && r.every(x => x.kind === "answer") && /KU-RX-142/.test(by.pharmacy.text) && /KU-IN-143/.test(by.insurance.text) && /KU-SH-141/.test(by.member.text), banner);
  T("Role-based answers", "Only Priya sees the override code; Ivan is told to send the call to pharmacy", /EM-14/.test(by.pharmacy.text) && !/EM-14/.test(by.insurance.text) && !/EM-14/.test(by.member.text) && /send the call to the pharmacy team/.test(by.insurance.text));
  T("Role-based answers", "Banner explains the different answers", /Same question, three approved answers/.test(banner));
  r = await ask(p, "can I refill early", "member");
  T("Member chat", "A generic question gets a question back before any answer", r[0].kind === "clarify" && /Do you live in a county affected by Hurricane Delia/.test(r[0].text) && !/refill your prescriptions early/.test(r[0].text));
  await A(p, "clarify", "declared"); r = await p.evaluate(() => [...document.querySelectorAll("#res .ans")].map(a => ({ kind: a.dataset.kind, text: a.querySelector(".ans-b").innerText })));
  T("Member chat", "Answering Yes gives Legal's exact member wording", r[0].kind === "answer" && /KU-SH-141/.test(r[0].text) && /until October 31, 2026/.test(r[0].text));
  await A(p, "clarify", "outside").catch(() => {});
  const mcases = [[EVAC, "answer", "KU-SH-141"], ["lost my medication in the flood", "answer", "KU-SH-144"], ["how do I pay my premium", "answer", "KU-IN-022"], ["can I get extra medication for a trip", "answer", "KU-RX-032"], ["are drug prices final", "answer", "KU-RX-013"], ["which counties are covered", "answer", "KU-SH-145"], ["I don't live in an affected county, can I refill early?", "answer", "KU-RX-031"], ["replace oxygen tank", "none", null], ["hurricane damage to my house", "none", null]];
  for (const [q, kind, unit] of mcases) { const x = await ask(p, q, "member"); const ok = x[0].kind === kind && (unit ? x[0].text.includes(unit) : !/KU-/.test(x[0].text)); T("Member chat", `Harold types “${q}” → ${kind}${unit ? " " + unit : ""}`, ok, x[0].kind); }
  const cases = [["pharmacy", "member evacuated, needs an early refill", "answer", "KU-RX-142"], ["pharmacy", "refill too soon", "clarify", null], ["pharmacy", "lost medication", "answer", "KU-SH-144"], ["pharmacy", "Rx pricing disclaimer", "answer", "KU-RX-013"], ["insurance", "EM-14 override code", "scope", null], ["insurance", "which counties are declared", "answer", "KU-SH-145"], ["insurance", "where is my claim", "answer", "KU-IN-023"], ["insurance", "how do I pay my premium", "answer", "KU-IN-022"], ["pharmacy", "what's the weather today", "none", null], ["insurance", "flood insurance claim", "none", null]];
  for (const [role, q, kind, unit] of cases) { const x = await ask(p, q, role); const ok = x[0].kind === kind && (unit ? x[0].text.includes(unit) : !/KU-/.test(x[0].text));
    T("Free-text search", `${ROLE_NAME[role]} types “${q}” → ${kind}${unit ? " " + unit : ""}`, ok, `${x[0].kind}`); }
  await p.close(); }

// ---------- The second sample still runs end to end ----------
{ const p = await page(); await A(p, "manual"); await A(p, "sample-rx"); await A(p, "extract");
  const cf = await p.locator(".conflict").innerText(); T("Rx script sample", "The pricing disclaimer is flagged against the 2024 wording, with its word overlap", /Rx pricing disclaimer/.test(cf) && /7\d% word overlap/.test(cf), cf.replace(/\s+/g, " ").slice(0, 120));
  await A(p, "cf", "merge", "KU-RX-013"); await approveAndPublish(p);
  let r = await ask(p, "Rx pricing disclaimer", "pharmacy"); T("Rx script sample", "Merged: Priya gets the v3 disclaimer, read exactly", r[0].kind === "answer" && /KU-RX-103/.test(r[0].text) && /The prices I share today/.test(r[0].text) && /Read exactly/i.test(r[0].text));
  await A(p, "goto", 4); await A(p, "revise-source"); r = await ask(p, "Rx pricing disclaimer", "pharmacy"); T("Rx script sample", "Lena's revision withholds it, with no 2024 fallback", r[0].kind === "held" && !/Prices quoted/.test(r[0].text));
  await A(p, "goto", 4); await p.click('#app .affected [data-act="approve"]'); await p.click('#app .affected [data-act="authorize"]'); await p.click('#app .affected [data-act="publish"]');
  r = await ask(p, "Rx pricing disclaimer", "pharmacy"); T("Rx script sample", "After Lena approves r2, the v4 wording is served", r[0].kind === "answer" && /before your order ships/.test(r[0].text) && /KU-RX-103 r2/.test(r[0].text));
  await p.close(); }

// ---------- §8 guided vs manual, reset ----------
{ const p = await page();
  await p.evaluate(() => document.getElementById("s5").scrollIntoView()); await p.waitForTimeout(2000);
  let sub = await p.locator("#appsub").innerText(), mode = await p.locator("#modepill").innerText();
  T("§8 Guided vs manual", "Guided scroll loads the search step with a labelled sample", /Search/.test(sub) && /Sample/.test(mode));
  await p.click(`#app [data-act="q"][data-x="${EVAC}"]`); let txt = await p.locator("#res").innerText();
  T("§8 Guided vs manual", "Guided approvals are labelled as the pre-approved sample, not a person", /Pre-approved sample/.test(txt));
  await A(p, "manual"); mode = await p.locator("#modepill").innerText();
  await p.evaluate(() => document.getElementById("s3").scrollIntoView()); await p.waitForTimeout(1900); await p.evaluate(() => document.getElementById("s6").scrollIntoView()); await p.waitForTimeout(1900);
  const st = await p.evaluate(() => { const s = window.__KL.state(); return { mode: s.mode, units: s.units.filter(u => !u.lib).length, approved: s.units.some(u => !u.lib && u.revs.some(r => r.content)) }; });
  T("§8 Guided vs manual", "Manual scrolling never extracts, approves or publishes", /Manual/.test(mode) && st.mode === "manual" && st.units === 0 && !st.approved, JSON.stringify(st));
  await A(p, "reset"); const after = await p.evaluate(() => { const s = window.__KL.state(); return { mode: s.mode, step: s.step, units: s.units.filter(u => !u.lib).length }; });
  T("§8 Guided vs manual", "Reset restores the starting state", after.mode === "guided" && after.step === -1 && after.units === 0, JSON.stringify(after));
  await p.close(); }

// ---------- §13 misleading precision ----------
{ const p = await page(); await p.evaluate(() => { location.hash = "review"; }); await p.waitForTimeout(300);
  const t = await p.locator("#app").innerText(); T("§13 Precision", "No AI confidence percentages; the conflict is labelled a classification, not a judgement", !/AI \d+%/.test(t) && /not a judgement of which is right/.test(t));
  await p.close(); }

// ---------- Play the story ----------
{ const p = await page(); await p.locator("[data-play]").first().click(); await p.waitForFunction(() => window.__playDone === true, null, { timeout: 420000 });
  const g = await p.evaluate(() => { const r = window.__KL.runGolden(); return `${r.filter(x => x.pass).length}/${r.length}`; });
  T("Play the story", "Explore's self-running story reaches the end, with every golden case passing", g === "10/10", g); await p.close(); }

// ---------- Layout ----------
{ const p = await page({ width: 390, height: 820 });
  T("Layout", "Mobile: no horizontal scroll", !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  await p.click('#s5 [data-show="search"]'); await p.waitForTimeout(500); T("Layout", "Mobile: Show me opens the prototype sheet", await p.locator("#app.open").count() === 1);
  await p.screenshot({ path: "t-mobile.png" }); await p.close(); }
{ const p = await page(); T("Layout", "Desktop: no horizontal scroll", !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  for (const h of ["review", "approve", "search", "current", "gaps", "evaluate"]) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(150); await p.locator("#app").screenshot({ path: `t-${h}.png` }); }
  await p.close(); }

T("Console", "No page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
fs.writeFileSync("accept.json", JSON.stringify(results, null, 1));
console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed`);
await b.close();
