import { chromium } from "playwright";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const base = "file://" + path.resolve(here, "../knowledge-layer.html");
const results = []; const errs = [];
const T = (name, pass, detail = "") => { results.push({ group: "Presenter mode", name, pass: !!pass, detail }); console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/knowledge-layer-walkthrough/.test(m.text())) errs.push(m.text()); });
await p.goto(base); await p.waitForLoadState("networkidle");
const st = () => p.evaluate(() => ({ view: window.__KL.view(), screen: window.__KL.screen(), k: window.__KL.step(), appIn: !!document.querySelector("#presStage #app"), cap: (document.querySelector("#stepCap b") || {}).textContent || "", spot: !!document.querySelector("#pres .spot") }));
const ids = await p.evaluate(() => window.__KL.fixtures.screens.map(s => s.id));
const go = (id) => p.evaluate(x => window.__KL.goScreen(x), ids.indexOf(id));
const right = async (n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(60); } };
let s = await st(); T("Opens in presenter mode on the title screen", s.view === "present" && s.screen === "title", JSON.stringify(s));
await p.screenshot({ path: "p-title.png" });
const bar = await p.evaluate(() => ({ btns: [...document.querySelectorAll(".pres-top a, .pres-top button")].map(b => b.getAttribute("aria-label") || b.textContent.trim()), word: document.querySelector(".pres-top").innerText.includes("Knowledge Layer") }));
T("Top bar: the logo and Speaker notes only, with no repeated product name", bar.btns.length === 2 && /back to the first screen/.test(bar.btns[0]) && /Speaker notes/.test(bar.btns[1]) && !bar.word, JSON.stringify(bar));
await right(); s = await st(); T("→ opens the cold open on its first step, with a caption and a spotlight", s.screen === "cold" && s.k === 0 && s.appIn && /Priya is on a live call/.test(s.cap) && s.spot, JSON.stringify(s));
await right(); s = await st(); T("→ inside a beat performs the next step (Priya's search shows three wordings)", s.screen === "cold" && s.k === 1 && /Three documents, three wordings/.test(s.cap) && (await p.locator("#app .lres").count()) === 3);
await p.screenshot({ path: "p-cold.png" });
await right(); s = await st(); T("After the last step, → moves on and parks the prototype", s.screen === "problem" && !s.appIn);
await p.screenshot({ path: "p-problem.png" });
// notes tab
const n = await ctx.newPage(); n.on("pageerror", e => errs.push(e.message)); await n.goto(base + "#notes"); await n.waitForTimeout(600);
let nt = await n.locator("#notesView").innerText(); T("Notes tab links and follows the current screen", /Following the presentation/.test(nt) && /One disclaimer, three wordings/.test(nt), nt.slice(0, 120).replace(/\s+/g, " "));
await n.click('[data-n="next"]'); await p.waitForTimeout(300); s = await st(); T("Notes tab Next drives the presentation", s.screen === "who", s.screen);
nt = await n.locator("#notesView").innerText(); T("Notes show target time and a running timer", /Target/.test(nt) && /\d+:\d\d/.test(nt));
// the demo, stepped with the arrow keys
await go("demo"); await right(); s = await st();
T("Beat 1 starts a clean session on its first step", s.screen === "bulletin" && s.k === 0 && (await p.evaluate(() => window.__KL.state().units.filter(u => !u.lib).length)) === 0, JSON.stringify(s));
await p.waitForTimeout(500); nt = await n.locator("#notesView").innerText(); T("Notes list the beat's steps and follow the current one", /Steps · press → for each/i.test(nt) && /6 pm: an emergency bulletin reaches Nina/.test(nt), nt.slice(0, 60));
await right(); s = await st(); T("Step 2: AI splits the bulletin into five units", s.k === 1 && (await p.evaluate(() => window.__KL.state().units.filter(u => u.origin === "extract").length)) === 5 && /five answers/.test(s.cap));
await right(2); s = await st(); T("Step 4: Nina's decision is applied (an exception)", s.k === 3 && (await p.evaluate(() => window.__KL.state().units.find(u => u.id === "KU-RX-142").dupChoice)) === "keep");
await p.screenshot({ path: "p-bulletin.png" });
await p.keyboard.press("ArrowLeft"); s = await st(); T("← goes back one step and rebuilds that state exactly", s.screen === "bulletin" && s.k === 2 && (await p.evaluate(() => window.__KL.state().units.find(u => u.id === "KU-RX-142").dupChoice)) === null);
await right(2); s = await st(); T("→ from the last step continues into beat 2 with the same state", s.screen === "approve" && s.k === 0 && (await p.evaluate(() => window.__KL.state().units.find(u => u.id === "KU-RX-142").dupChoice)) === "keep");
await right(3); s = await st(); const pub = await p.evaluate(() => window.__KL.state().units.filter(u => u.origin === "extract" && u.live).length);
T("Beat 2's steps approve as Lena and Robin, then Nina publishes", s.k === 3 && pub === 5 && /Nina publishes/.test(s.cap), `${pub} published`);
const by = await p.evaluate(() => { const u = window.__KL.state().units.find(x => x.id === "KU-SH-141"); return u.revs[0].content.by + "/" + u.revs[0].audience.by; }); T("Approvals are recorded against the named people", by === "lena/robin", by);
await p.screenshot({ path: "p-approve.png" });
await right(2); s = await st(); const chat = await p.locator("#res .cbubble.bot").innerText().catch(() => "");
T("Beat 3: Harold gets Legal's exact wording in member chat", s.screen === "ask" && s.k === 1 && /refill your prescriptions early/.test(chat), chat.slice(0, 60));
await right(); T("Beat 3: All three shows three different approved answers", (await p.locator('#res .ans[data-kind="answer"]').count()) === 3);
await right(); const ask2 = await p.locator("#res").innerText(); T("Beat 3: an unclear question gets a question back", /Do you live in a county affected by Hurricane Delia/.test(ask2));
await p.click('#app [data-act="clarify"][data-x="declared"]'); T("The prototype stays live between steps (answering Yes gives the answer)", /refill your prescriptions early/.test(await p.locator("#res").innerText()));
await p.fill("#q", "closing"); await p.press("#q", "ArrowRight"); s = await st(); T("Arrow keys inside the search box don't change steps", s.screen === "ask" && s.k === 3);
await p.evaluate(() => document.activeElement.blur());
// jumping straight to a later beat rebuilds it
await go("extend"); s = await st(); T("Jumping to a beat rebuilds its state from the script", s.screen === "extend" && s.k === 0 && (await p.evaluate(() => window.__KL.state().units.filter(u => u.origin === "extract" && u.live).length)) === 5);
await right(); const held = await p.locator(".now3").innerText(); T("Extension step: Harold is told it's being updated, never the standing rule", /being updated/.test(held) && !/refill too soon;|75%/.test(held));
await go("trust"); await right(); const g1 = await p.evaluate(() => window.__KL.runGolden().filter(x => !x.pass).map(x => x.g.id).join(",")); T("Trust step 2 breaks the override: two golden cases fail", g1 === "G2,G8", g1);
await right(); const g = await p.evaluate(() => { const r = window.__KL.runGolden(); return { p: r.filter(x => x.pass).length, n: r.length }; }); T("Trust step 3 restores it: every golden case passes", g.p === g.n, `${g.p}/${g.n}`);
await p.screenshot({ path: "p-trust.png" });
await p.click('[data-pact="restart"]'); s = await st(); T("Restart returns to the beat's first step", s.screen === "trust" && s.k === 0);
await p.click('[data-pact="play"]'); await p.waitForTimeout(9800); s = await st(); T("Play steps through the beat on its own", s.screen === "trust" && s.k === 2, JSON.stringify(s));
await go("roadmap"); const road = await p.locator("#presStage").innerText(); T("Roadmap slide: four phases, one line each and an exit", (await p.locator(".road > div").count()) === 4 && road.split(/\s+/).length < 110, `${road.split(/\s+/).length} words`);
await p.keyboard.press("ArrowLeft"); s = await st(); T("← onto a beat lands on its last step", s.screen === "trust" && s.k === 2);
// keyboard extras
await p.keyboard.press("o"); T("O opens all screens", await p.locator("#ovPanel").isVisible()); await p.keyboard.press("Escape"); T("Esc closes it", await p.locator("#ovPanel").isHidden());
await p.keyboard.press("a"); s = await st(); T("A jumps to the Q&A appendix", s.screen === "qa"); await p.screenshot({ path: "p-qa.png" });
await p.click('.qa[data-goto-screen="extend"]'); s = await st(); T("A question jumps to the screen that answers it", s.screen === "extend");
await go("journey"); await p.click('#presStage [data-show="review"]'); s = await st(); T("Journey chip jumps to the matching demo step", s.screen === "bulletin" && s.k === 2, JSON.stringify(s));
await p.evaluate(() => document.activeElement.blur()); await p.keyboard.press("e"); await p.waitForTimeout(200); s = await st(); T("E switches to Explore with the app back in its place", s.view === "explore" && !s.appIn);
await p.click('#explore .top [data-home]'); s = await st(); T("From Explore, the logo returns to the first screen", s.screen === "title" && s.view === "present", JSON.stringify(s));
await go("ask"); await p.click('.pres-top [data-home]'); s = await st(); T("The logo returns to the first screen", s.screen === "title" && s.view === "present");
// layout
let wide = []; for (let i = 0; i < ids.length; i++) { await p.evaluate(x => window.__KL.goScreen(x), i); const o = await p.evaluate(() => { const st = document.getElementById("presStage"); return st.scrollWidth > st.clientWidth + 1; }); if (o) wide.push(ids[i]); }
T("No screen scrolls sideways at 1440×900", wide.length === 0, wide.join(","));
const m = await b.newPage({ viewport: { width: 390, height: 820 } }); m.on("pageerror", e => errs.push(e.message)); await m.goto(base); await m.waitForLoadState("networkidle");
wide = []; for (let i = 0; i < ids.length; i++) { await m.evaluate(x => window.__KL.goScreen(x), i); const o = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth || (s => s.scrollWidth > s.clientWidth + 1)(document.getElementById("presStage"))); if (o) wide.push(ids[i]); }
T("No screen scrolls sideways on a phone", wide.length === 0, wide.join(","));
for (const [id, f] of [["problem", "m-problem"], ["approve", "m-approve"], ["roadmap", "m-roadmap"]]) { await m.evaluate(x => window.__KL.goScreen(x), ids.indexOf(id)); await m.screenshot({ path: f + ".png" }); }
T("No page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
fs.writeFileSync("pres.json", JSON.stringify(results, null, 1)); console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed`);
await b.close();
