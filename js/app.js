// TaalForge v5: app shell, router and the PM Dutch / French tracks.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ── Icons (stroke icons, 24px grid)
  const I = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6a2 2 0 012 2v13a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v13a2 2 0 012-2h6z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="13" height="13" rx="1"/><path d="M8 4h13v13"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 010 5M21 20c0-2.6-1.6-4.8-4-5.6"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2-7z"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5L20 6"/></svg>'
  };
  window.I = I;

  // ── Router
  const routes = [];
  function route(pattern, fn) { routes.push({ re: new RegExp("^" + pattern.replace(/:(\w+)/g, "([^/]+)") + "$"), fn }); }
  function go(hash) { location.hash = hash; }
  window.go = go;

  function currentTrack() { const t = Store.get("tf-lang", "nl"); return TRACKS[t] ? t : "nl"; }
  function setTrack(t) { if (TRACKS[t]) Store.set("tf-lang", t); }

  function dispatch() {
    Speech.stop(); Speech.cancelListen();
    const path = (location.hash || "#/").slice(1) || "/";
    const seg = path.split("/")[1];
    if (TRACKS[seg]) setTrack(seg);
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) { render(r.fn(...m.slice(1).map(decodeURIComponent))); return; }
    }
    go("#/" + currentTrack());
  }

  // A view is { html, mount(root) } or a plain HTML string.
  function render(view) {
    const v = typeof view === "string" ? { html: view } : view;
    const main = $("#main");
    main.innerHTML = v.html;
    shell();
    if (v.mount) v.mount(main);
    window.scrollTo(0, 0);
    const h = main.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  window.render = render;

  // ── Header and bottom navigation
  function shell() {
    const t = currentTrack();
    const p = Progress.get();
    $("#tracks").innerHTML = Object.entries(TRACKS).map(([k, v]) =>
      `<a href="#/${k}" class="track${k === t ? " on" : ""}" ${k === t ? 'aria-current="page"' : ""}>${v.label}</a>`).join("");
    $("#meta").innerHTML = `<span title="Days in a row">${p.streak || 1} d</span><span title="Experience points">${Progress.totalXP()} XP</span>`;
    const path = location.hash.slice(1);
    const items = t === "a1"
      ? [["#/a1", I.home, "Units"], ["#/a1/speak", I.mic, "Speaking"], ["#/a1/tutor", I.chat, "Tutor"], ["#/a1/about", I.user, "Over mij"]]
      : [["#/" + t, I.home, "Home"], ["#/" + t + "/lessons", I.book, "Lessons"], ["#/" + t + "/scenarios", I.people, "Scenarios"], ["#/" + t + "/vocab", I.cards, "Words"], ["#/" + t + "/tutor", I.chat, "Tutor"]];
    $("#nav").innerHTML = items.map(([href, icon, label]) => {
      const on = path === href.slice(1) || (href.split("/").length > 2 && path.startsWith(href.slice(1)));
      return `<a href="${href}" class="${on ? "on" : ""}" ${on ? 'aria-current="page"' : ""}>${icon}<span>${label}</span></a>`;
    }).join("");
  }

  // ── Shared: sentence player (passive phase, A1 Listen block)
  // opts: { sentences, lang, listenFirst, onFinish(label), finishLabel }
  function Player(el, opts) {
    const s = { idx: 0, shown: false, note: false, heard: new Set(), shadow: false, listenFirst: opts.listenFirst, result: null };
    const lang = opts.lang;
    const list = opts.sentences;

    function draw() {
      const cur = list[s.idx];
      const hidden = s.listenFirst && !s.heard.has(s.idx);
      el.innerHTML = `
        <div class="sheet">
          <div class="row-between small muted">
            <span>Sentence ${s.idx + 1} of ${list.length}</span>
            <label class="switch"><input type="checkbox" data-a="lf" ${s.listenFirst ? "checked" : ""}> Listen first</label>
          </div>
          <div class="bar"><i style="width:${((s.idx + 1) / list.length) * 100}%"></i></div>
          <div class="sentence-wrap">
            <button class="icon-btn big" data-a="play" aria-label="Play sentence">${I.play}</button>
            <p class="target${hidden ? " veiled" : ""}" lang="${lang}" aria-live="polite">${hidden ? "Listen first, then the sentence appears." : esc(Learner.fill(cur.target))}</p>
          </div>
          ${s.shown ? `<p class="trans">${esc(Learner.fill(cur.en))}</p>
            ${cur.note ? `<details class="note"><summary>Note</summary><p>${esc(Learner.fill(cur.note))}</p></details>` : ""}`
            : `<button class="link" data-a="show">Show translation</button>`}
          ${Speech.canListen && !hidden ? `<div class="say"><button class="btn ghost" data-a="say">${I.mic} Say it</button><div class="say-result">${s.result || ""}</div></div>` : ""}
          <div class="actions">
            <button class="btn ghost" data-a="prev" ${s.idx === 0 ? "disabled" : ""}>Previous</button>
            ${s.idx < list.length - 1 ? `<button class="btn" data-a="next">Next</button>` : `<button class="btn" data-a="finish">${esc(opts.finishLabel || "Done")}</button>`}
            ${s.shadow ? `<button class="btn ghost" data-a="stopshadow">${I.stop} Stop</button>` : `<button class="btn ghost" data-a="shadow">${I.play} Shadow mode</button>`}
          </div>
        </div>`;
    }
    function play(i, cb) {
      Speech.speak(Learner.fill(list[i].target), lang, { onend: () => { s.heard.add(i); if (i === s.idx && s.listenFirst) draw(); cb && cb(); } });
    }
    function move(d) { s.idx = Math.max(0, Math.min(list.length - 1, s.idx + d)); s.shown = false; s.result = null; Speech.stop(); draw(); }
    async function shadow() {
      s.shadow = true; draw();
      for (let i = s.idx; i < list.length && s.shadow; i++) {
        s.idx = i; s.shown = false; s.heard.add(i); draw();
        await new Promise(r => play(i, r));
        if (!s.shadow) break;
        const words = list[i].target.split(" ").length;
        await new Promise(r => setTimeout(r, Math.max(1500, 350 * words)));
      }
      s.shadow = false; draw();
    }
    el.addEventListener("click", async e => {
      const a = e.target.closest("[data-a]"); if (!a) return;
      const act = a.dataset.a;
      if (act === "play") play(s.idx);
      if (act === "show") { s.shown = true; draw(); }
      if (act === "prev") move(-1);
      if (act === "next") move(1);
      if (act === "finish") opts.onFinish && opts.onFinish();
      if (act === "shadow") shadow();
      if (act === "stopshadow") { s.shadow = false; Speech.stop(); draw(); }
      if (act === "say") {
        s.result = '<span class="muted">Listening…</span>'; draw();
        s.result = await sayScore(Learner.fill(list[s.idx].target), lang); draw();
      }
    });
    el.addEventListener("change", e => {
      if (e.target.dataset.a === "lf") { s.listenFirst = e.target.checked; Store.set(opts.listenKey || "tf-listen-first", s.listenFirst ? "1" : "0"); draw(); }
    });
    draw();
  }
  window.Player = Player;

  // Speech recognition → score + highlighted words (HTML string).
  async function sayScore(target, lang) {
    try {
      const alts = await Speech.listen(lang);
      const best = alts.map(h => ({ h, r: Dutch.similarity(target, h) })).sort((a, b) => b.r.score - a.r.score)[0];
      const grade = best.r.score >= 85 ? "good" : best.r.score >= 60 ? "ok" : "low";
      const words = best.r.words.map(w => `<span class="${w.ok ? "hit" : "miss"}">${esc(w.w)}</span>`).join(" ");
      return `<div class="score ${grade}"><b>${best.r.score}%</b><span>${grade === "good" ? "Goed zo!" : grade === "ok" ? "Bijna. Try the red words again." : "Listen again, then try once more."}</span></div>
        <p class="heard"><span class="muted">Heard:</span> “${esc(best.h)}”</p><p class="words">${words}</p>`;
    } catch (err) { return `<p class="err">${esc(err.message)}</p>`; }
  }
  window.sayScore = sayScore;

  // ── Shared: chat (scenarios, tutor)
  function Chat(el, { lang, system, hint, starter }) {
    const s = { msgs: [], busy: false, err: "" };
    function draw() {
      el.innerHTML = `
        <div class="chat" aria-live="polite">
          ${!s.msgs.length && hint ? `<p class="muted hint">${esc(hint)}</p>` : ""}
          ${s.msgs.filter(m => !m.hidden).map(m => `<div class="msg ${m.role}">
              ${m.role === "assistant" ? `<button class="icon-btn" data-a="say" data-t="${esc(m.content)}" aria-label="Read aloud">${I.play}</button>` : ""}
              <div class="bubble" lang="${m.role === "assistant" ? lang : ""}">${esc(m.content)}</div></div>`).join("")}
          ${s.busy ? `<p class="muted">${lang === "fr" ? "Un instant…" : "Even denken…"}</p>` : ""}
          ${s.err ? `<p class="err">${esc(s.err)} ${s.err.includes("Settings") ? '<a href="#/settings">Open Settings</a>' : ""}</p>` : ""}
        </div>
        ${starter && !s.msgs.length ? `<button class="btn" data-a="start">Start the conversation</button>` : `
        <form class="composer" data-a="form">
          <input type="text" name="m" autocomplete="off" placeholder="${lang === "fr" ? "Type in French or English" : "Type in Dutch or English"}" aria-label="Your message">
          ${Speech.canListen ? `<button type="button" class="icon-btn" data-a="dictate" aria-label="Speak your message">${I.mic}</button>` : ""}
          <button class="icon-btn solid" aria-label="Send" ${s.busy ? "disabled" : ""}>${I.send}</button>
        </form>`}`;
      const last = el.querySelector(".msg:last-of-type"); if (last) last.scrollIntoView({ block: "nearest" });
    }
    async function send(text, hidden) {
      if (!text.trim() || s.busy) return;
      s.msgs.push({ role: "user", content: text, hidden }); s.busy = true; s.err = ""; draw();
      try { s.msgs.push({ role: "assistant", content: await AI.send(s.msgs, system) }); }
      catch (e) { s.err = e.message; s.msgs.pop(); }
      s.busy = false; draw();
      const inp = el.querySelector("input[name=m]"); if (inp) inp.focus();
    }
    el.addEventListener("click", async e => {
      const a = e.target.closest("[data-a]"); if (!a) return;
      if (a.dataset.a === "say") Speech.speak(a.dataset.t.replace(/\([^)]*\)/g, "").trim(), lang);
      if (a.dataset.a === "start") send(starter, true);
      if (a.dataset.a === "dictate") {
        try { const alts = await Speech.listen(lang); el.querySelector("input[name=m]").value = alts[0]; }
        catch (err) { s.err = err.message; draw(); }
      }
    });
    el.addEventListener("submit", e => { e.preventDefault(); const inp = e.target.m; const v = inp.value; inp.value = ""; send(v); });
    draw();
    return { reset() { s.msgs = []; s.err = ""; draw(); } };
  }
  window.Chat = Chat;

  // ── PM Dutch / French: home
  function lastPassiveNum(t) {
    const p = Progress.get()[t]; const last = p.passiveDone[p.passiveDone.length - 1];
    return (TF[t].find(l => l.id === last) || {}).num || 0;
  }
  function waveOpen(t, l) { const p = Progress.get()[t]; return l.num <= lastPassiveNum(t) - 6 && !p.activeDone.includes(l.id); }

  function lessonRow(t, l) {
    const p = Progress.get()[t];
    const pd = p.passiveDone.includes(l.id), ad = p.activeDone.includes(l.id), wave = waveOpen(t, l);
    return `<li><a href="#/${t}/lesson/${l.id}" class="lesson-row">
      <span class="num">${l.num}</span>
      <span class="grow"><span class="title" lang="${t}">${esc(l.title)}</span><span class="sub">${esc(l.titleEn)} <em>${l.difficulty}</em>${l.isRevision ? " <em>Revision</em>" : ""}</span></span>
      <span class="marks">${pd ? `<span class="mark" title="Passive phase done">${I.tick}</span>` : ""}${ad ? `<span class="mark wave" title="Second wave done">${I.tick}</span>` : ""}${wave ? `<span class="pill">Second wave</span>` : ""}</span>
    </a></li>`;
  }

  route("/(nl|fr)", t => {
    const lessons = TF[t], p = Progress.get()[t];
    const next = lessons.find(l => !p.passiveDone.includes(l.id));
    const wave = lessons.filter(l => waveOpen(t, l));
    const pct = Math.round((p.passiveDone.length / lessons.length) * 100);
    return `
      <section class="intro">
        <h1>${t === "nl" ? "PRINCE2 Dutch for Belgian projects" : "PRINCE2 French for Belgian projects"}</h1>
        <p class="lede">Welkom, ${esc(Learner.name())}. Assimil two-wave method with a recurring cast: Dirk (sponsor), Fatima (BA), Thomas (dev lead), Caroline (client), Jan (procurement).</p>
        <div class="progress-line"><b>${p.passiveDone.length}</b> of ${lessons.length} lessons<div class="bar"><i style="width:${pct}%"></i></div><span class="muted">${p.xp} XP</span></div>
      </section>
      ${next ? `<a class="continue" href="#/${t}/lesson/${next.id}"><span class="small muted">Continue with lesson ${next.num}</span><span class="title" lang="${t}">${esc(next.title)}</span><span class="sub">${esc(next.titleEn)}</span></a>` : `<p class="done-note">All ${lessons.length} lessons done. Finish the second wave below.</p>`}
      ${wave.length ? `<section><h2>Second wave</h2><p class="muted">Translate earlier lessons back into ${TRACKS[t].name}.</p><ul class="rows">${wave.slice(0, 4).map(l => lessonRow(t, l)).join("")}</ul></section>` : ""}
      <section><h2>Lessons</h2><ul class="rows">${lessons.map(l => lessonRow(t, l)).join("")}</ul></section>`;
  });

  route("/(nl|fr)/lessons", t => {
    const cats = ["all", ...new Set(TF[t].map(l => l.category))];
    return {
      html: `<h1>Lessons</h1><div class="chips" role="group" aria-label="Filter by topic">${cats.map(c => `<button class="chip${c === "all" ? " on" : ""}" data-c="${c}">${c === "all" ? "All" : CATS[c] || c}</button>`).join("")}</div><ul class="rows" id="list"></ul>`,
      mount(root) {
        const list = $("#list", root);
        const show = c => { list.innerHTML = TF[t].filter(l => c === "all" || l.category === c).map(l => lessonRow(t, l)).join(""); };
        root.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; $$(".chip", root).forEach(x => x.classList.toggle("on", x === b)); show(b.dataset.c); });
        show("all");
      }
    };
  });

  // ── Lesson
  route("/(nl|fr)/lesson/([^/?]+)(?:\\?tab=(\\w+))?", (t, id, tab) => {
    const l = TF[t].find(x => x.id === id);
    if (!l) return `<p>Lesson not found. <a href="#/${t}">Back</a></p>`;
    const p = Progress.get()[t];
    const passiveDone = p.passiveDone.includes(l.id);
    const open = l.num <= lastPassiveNum(t) - 6 || passiveDone;
    tab = tab === "active" && open ? "active" : "passive";
    return {
      html: `
        <a class="back" href="#/${t}">${I.back} ${TRACKS[t].label}</a>
        <header class="lesson-head">
          <p class="small muted">Lesson ${l.num}, ${CATS[l.category] || l.category}, ${l.difficulty}${l.isRevision ? ", revision" : ""}</p>
          <h1 lang="${t}">${esc(l.title)}</h1>
          <p class="sub">${esc(l.titleEn)}</p>
          ${l.grammarFocus ? `<ul class="tags">${l.grammarFocus.map(g => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        </header>
        <div class="tabs" role="tablist">
          <a role="tab" href="#/${t}/lesson/${l.id}" class="${tab === "passive" ? "on" : ""}" aria-selected="${tab === "passive"}">Passive${passiveDone ? " ✓" : ""}</a>
          ${open ? `<a role="tab" href="#/${t}/lesson/${l.id}?tab=active" class="${tab === "active" ? "on" : ""}" aria-selected="${tab === "active"}">Second wave${p.activeDone.includes(l.id) ? " ✓" : ""}</a>`
                 : `<span role="tab" class="locked" aria-disabled="true" title="Opens after six more lessons">Second wave (locked)</span>`}
        </div>
        <div id="pane"></div>
        ${tab === "passive" ? `
          ${l.document ? `<section class="doc"><h2>Document: ${esc(l.document.title)}</h2><pre lang="${t}">${esc(Learner.fill(l.document.content))}</pre></section>` : ""}
          ${l.culturalNote ? `<section class="cultural"><h2>Cultural note</h2><p>${esc(Learner.fill(l.culturalNote))}</p></section>` : ""}
          <details class="all"><summary>All sentences</summary><ol>${l.sentences.map(s => `<li><span lang="${t}">${esc(Learner.fill(s.target))}</span><span class="muted">${esc(Learner.fill(s.en))}</span></li>`).join("")}</ol></details>` : ""}`,
      mount(root) {
        const pane = $("#pane", root);
        if (tab === "passive") {
          Player(pane, {
            sentences: l.sentences, lang: t, listenFirst: Store.get("tf-listen-first", "0") === "1",
            finishLabel: passiveDone ? "Passive phase done ✓" : "Complete passive phase (+30 XP)",
            onFinish() { Progress.passive(l.id); go("#/" + t); }
          });
        } else {
          pane.innerHTML = `<p class="wave-intro">Second wave: translate each English sentence back into ${TRACKS[t].name}. Don't peek at the lesson.</p>
            <ol class="wave">${l.sentences.map((s, i) => `<li><p>${esc(Learner.fill(s.en))}</p>
              <div class="answer"><input type="text" data-i="${i}" lang="${t}" autocomplete="off" autocapitalize="off" aria-label="Your translation"><button class="btn ghost" data-check="${i}">Check</button></div>
              <p class="feedback" id="fb${i}" aria-live="polite"></p></li>`).join("")}</ol>
            <div id="wavedone"></div>`;
          const ok = {};
          const norm = x => x.toLowerCase().replace(/[.,!?'—–-]/g, "").replace(/\s+/g, " ").trim();
          const check = i => {
            const val = norm($(`input[data-i="${i}"]`, pane).value), want = norm(Learner.fill(l.sentences[i].target));
            ok[i] = val === want || (val.length > 3 && want.includes(val));
            $("#fb" + i, pane).innerHTML = ok[i] ? `<span class="red-tick">${I.tick}</span> ${t === "nl" ? "Goed zo!" : "Bravo !"}` : `Expected: <span lang="${t}">${esc(Learner.fill(l.sentences[i].target))}</span>`;
            const n = Object.values(ok).filter(Boolean).length;
            $("#wavedone", pane).innerHTML = n >= 0.7 * l.sentences.length ? `<button class="btn" id="finishwave">Complete second wave (+50 XP)</button>` : `<p class="muted small">${n} of ${l.sentences.length} right. ${Math.ceil(0.7 * l.sentences.length)} needed.</p>`;
          };
          pane.addEventListener("click", e => {
            if (e.target.dataset.check) check(+e.target.dataset.check);
            if (e.target.id === "finishwave") { Progress.active(l.id); go("#/" + t); }
          });
          pane.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.i) check(+e.target.dataset.i); });
        }
      }
    };
  });

  // ── Scenarios
  route("/(nl|fr)/scenarios", t => `
    <h1>Scenarios</h1><p class="lede">Live practice with the cast. Needs your API key in Settings.</p>
    <ul class="rows">${TF.scenarios.filter(s => s.lang === t).map(s => `<li><a class="lesson-row" href="#/${t}/scenario/${s.id}">
      <span class="grow"><span class="title" lang="${t}">${esc(s.title)}</span><span class="sub" lang="${t}">${esc(Learner.fill(s.context))} <em>${s.difficulty}</em></span></span></a></li>`).join("")}</ul>`);

  route("/(nl|fr)/scenario/([^/]+)", (t, id) => {
    const sc = TF.scenarios.find(s => s.id === id);
    if (!sc) return `<p>Scenario not found. <a href="#/${t}/scenarios">Back</a></p>`;
    return {
      html: `<a class="back" href="#/${t}/scenarios">${I.back} Scenarios</a><h1 lang="${t}">${esc(sc.title)}</h1><p class="lede" lang="${t}">${esc(Learner.fill(sc.context))}</p><div id="chat"></div>`,
      mount(root) { Chat($("#chat", root), { lang: t, system: Learner.fill(sc.systemPrompt), starter: t === "nl" ? "Hallo, laten we beginnen." : "Bonjour, commençons." }); }
    };
  });

  // ── Vocabulary (v4 deck, counts kept in tf-vocab)
  route("/(nl|fr)/vocab", t => {
    const deck = Store.getJSON("tf-vocab", null) || TF.vocab;
    const st = { cat: "all", quiz: false, fwd: true, i: 0, flipped: {}, res: null };
    const items = () => deck.filter(v => v.lang === t && (st.cat === "all" || v.category === st.cat));
    const cats = ["all", ...new Set(deck.filter(v => v.lang === t).map(v => v.category))];
    function body() {
      const list = items();
      if (!list.length) return `<p class="muted">No words in this topic.</p>`;
      if (st.quiz) {
        const v = list[st.i % list.length];
        return `<div class="sheet quiz">
          <p class="small muted">${(st.i % list.length) + 1} of ${list.length}</p>
          <p class="target" lang="${st.fwd ? t : "en"}">${esc(st.fwd ? v.target : v.en)} ${st.fwd ? `<button class="icon-btn" data-say="${esc(v.target)}" aria-label="Play">${I.play}</button>` : ""}</p>
          <p class="muted" lang="${t}">${esc(Learner.fill(v.example))}</p>
          <form class="answer" data-f="q"><input type="text" name="a" autocomplete="off" autocapitalize="off" placeholder="${st.fwd ? "English" : TRACKS[t].name}" aria-label="Your answer" ${st.res ? "disabled" : ""}>
          <button class="btn">${st.res ? "Next" : "Check"}</button></form>
          ${st.res ? `<p class="feedback">${st.res === "ok" ? `<span class="red-tick">${I.tick}</span> Correct` : `Answer: ${esc(st.fwd ? v.en : v.target)}`}</p>` : ""}</div>`;
      }
      return `<ul class="vocab">${list.map((v, i) => `<li>
        <button class="icon-btn" data-say="${esc(v.target)}" aria-label="Play">${I.play}</button>
        <button class="flip" data-flip="${i}"><span lang="${st.flipped[i] === st.fwd ? "en" : t}">${esc(st.flipped[i] ? (st.fwd ? v.en : v.target) : (st.fwd ? v.target : v.en))}</span>${st.flipped[i] ? `<span class="muted small" lang="${t}">${esc(Learner.fill(v.example))}</span>` : ""}</button>
        <span class="small muted">✓${v.correct} ✗${v.wrong}</span></li>`).join("")}</ul>`;
    }
    return {
      html: `<h1>Words</h1>
        <div class="row-between"><div class="chips" id="cats">${cats.map(c => `<button class="chip${c === "all" ? " on" : ""}" data-c="${c}">${c === "all" ? "All" : CATS[c] || c}</button>`).join("")}</div></div>
        <div class="toolbar"><button class="btn ghost" data-a="dir"></button><button class="btn ghost" data-a="mode"></button></div><div id="vb"></div>`,
      mount(root) {
        const vb = $("#vb", root);
        const draw = () => {
          $("[data-a=dir]", root).textContent = st.fwd ? `${TRACKS[t].name} → English` : `English → ${TRACKS[t].name}`;
          $("[data-a=mode]", root).textContent = st.quiz ? "Show cards" : "Quiz me";
          vb.innerHTML = body();
          const inp = $("input[name=a]", vb); if (inp && !st.res) inp.focus();
        };
        root.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.c) { st.cat = b.dataset.c; st.i = 0; st.res = null; $$("#cats .chip", root).forEach(x => x.classList.toggle("on", x === b)); draw(); }
          if (b.dataset.a === "dir") { st.fwd = !st.fwd; st.flipped = {}; draw(); }
          if (b.dataset.a === "mode") { st.quiz = !st.quiz; st.i = 0; st.res = null; draw(); }
          if (b.dataset.say) Speech.speak(b.dataset.say, t);
          if (b.dataset.flip) { st.flipped[b.dataset.flip] = !st.flipped[b.dataset.flip]; draw(); }
        });
        root.addEventListener("submit", e => {
          e.preventDefault();
          if (st.res) { st.i++; st.res = null; draw(); return; }
          const v = items()[st.i % items().length];
          const want = (st.fwd ? v.en : v.target).toLowerCase(), got = e.target.a.value.toLowerCase().trim();
          const ok = got && want.includes(got);
          v[ok ? "correct" : "wrong"]++;
          Store.setJSON("tf-vocab", deck);
          st.res = ok ? "ok" : "no"; draw();
        });
        draw();
      }
    };
  });

  // ── Tutor (prompts from v4; the learner's name comes from Settings)
  const TUTOR = {
    nl: {
      conversation: ["Free conversation", "You are a friendly Dutch tutor for {name}, a Belgian PM with PRINCE2 training. Have natural conversations in Dutch, adjusting to level. After each Dutch response add a brief English translation in parentheses. Correct grammar gently by modeling the right form. Focus on PM topics — steering committees, change requests, risk logs, lessons-learned. If {name} writes in English, help express it in Dutch.", 'Try: "Ik wil oefenen met een stuurgroepvergadering."'],
      grammar: ["Grammar", 'You are a Dutch grammar tutor for a PM-focused learner. Explain rules with PM-flavoured examples (sponsor meetings, project reports). Cover: V2 word order, subordinate clauses, separable verbs, perfect tense, passive with "worden", modals, er-constructions, de/het articles. Include English translations. Be concise.', 'Try: "Explain V2 word order with a PM example."'],
      email: ["E-mail", 'You are a Dutch business email coach for {name}, a Belgian PM. Present scenarios: stage gate approval requests, change request forwards, exception reports, lessons-learned summaries. Review drafts, correct Dutch, suggest professional phrasing. Emphasize conventions: "Geachte heer/mevrouw", "Hierbij", "Bij voorbaat dank", "Met vriendelijke groet". Include English translations.', 'Try: "Help me write an email for a stage gate approval."']
    },
    fr: {
      conversation: ["Conversation libre", "Tu es un tuteur de français convivial pour {name}, un chef de projet belge avec formation PRINCE2. Ayez des conversations naturelles en français, ajustez au niveau. Après chaque réponse en français, ajoute une brève traduction anglaise entre parenthèses. Corrige la grammaire doucement en modélisant la bonne forme. Concentre-toi sur les sujets PM — comités de pilotage, demandes de changement, registres de risques, retours d'expérience. Si {name} écrit en anglais, aide à l'exprimer en français.", 'Try: "Je veux pratiquer un COPIL avec un sponsor exigeant."'],
      grammar: ["Grammaire", "Tu es un tuteur de grammaire française pour un apprenant PM. Explique les règles avec des exemples PM (réunions sponsor, rapports projet). Couvre: subjonctif, conditionnel, passé composé vs imparfait, pronoms relatifs, concordance des temps, registre formel vs familier. Inclus les traductions anglaises. Sois concis.", 'Try: "Explique le subjonctif avec un exemple PM."'],
      email: ["E-mail", "Tu es un coach d'e-mails professionnels français pour {name}, chef de projet belge. Propose des scénarios: demandes d'approbation de phase, transferts de demandes de changement, rapports d'exception, synthèses de retours d'expérience. Revois les brouillons, corrige le français, suggère des formulations pro. Souligne les conventions: \"Madame, Monsieur\", \"Veuillez trouver ci-joint\", \"Je reste à votre disposition\", \"Je vous prie d'agréer...\", \"Cordialement\". Inclus les traductions anglaises.", 'Try: "Aide-moi à rédiger un e-mail de demande d\'approbation de phase."']
    },
    a1: {
      conversation: ["Simple chat", "You are a patient Flemish NT2 teacher. The learner is an adult at A1 level following the Zo gezegd 1.1 course (greetings, name and spelling, country, languages, family, transport, numbers, prices, weather, the clock). Speak only very simple Dutch: short sentences, present tense, everyday words, Flemish forms like goeiemorgen and wablief. Ask one question at a time. After each Dutch reply, add a short English translation in parentheses. If the learner makes a mistake, repeat the correct sentence once, kindly, without grammar terms.", 'Try: "Goeiemorgen! Hoe gaat het?"'],
      test: ["Speaking test", "You are a Flemish NT2 teacher running an A1 speaking test. Ask these questions one at a time, in this order, in simple Dutch: voornaam en familienaam; hoe spel je dat; uit welk land kom je; welke talen spreek je; waar woon je; hoe oud ben je; ben je getrouwd; heb je kinderen; hoe kom je naar school; hoe ga je naar de supermarkt; hoelang woon je al in België; hoe gaat het; hoe is het weer vandaag. After each answer, say whether it was clear, give the corrected sentence if needed, then ask the next question. Add an English translation in parentheses after each of your turns. At the end, give three short tips.", "Tap Start. The teacher asks the first question."]
    }
  };
  function tutorView(t) {
    const modes = TUTOR[t]; const keys = Object.keys(modes);
    let mode = keys[0];
    return {
      html: `<h1>Tutor</h1><div class="chips" id="modes">${keys.map(k => `<button class="chip${k === mode ? " on" : ""}" data-m="${k}">${modes[k][0]}</button>`).join("")}<button class="chip" data-new>New chat</button></div><div id="chat"></div>
        ${AI.key() ? "" : `<p class="muted small">The tutor uses your own Anthropic API key. <a href="#/settings">Add it in Settings</a>.</p>`}`,
      mount(root) {
        const start = () => Chat($("#chat", root), { lang: TRACKS[t].lang, system: Learner.fill(modes[mode][1]), hint: modes[mode][2], starter: mode === "test" ? "Ik ben klaar voor de test." : null });
        let chat = start();
        root.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.m) { mode = b.dataset.m; $$("#modes .chip", root).forEach(x => x.classList.toggle("on", x === b)); $("#chat", root).replaceWith(Object.assign(document.createElement("div"), { id: "chat" })); chat = start(); }
          if (b.hasAttribute("data-new")) { $("#chat", root).replaceWith(Object.assign(document.createElement("div"), { id: "chat" })); chat = start(); }
        });
      }
    };
  }
  route("/(nl|fr|a1)/tutor", tutorView);

  // ── Settings
  route("/settings", () => {
    const rate = Speech.rate();
    return {
      html: `
        <a class="back" href="#/${currentTrack()}">${I.back} Back</a>
        <h1>Settings</h1>
        <section class="form">
          <h2>You</h2>
          <label>Your name in the PM and French lessons<input type="text" id="name" value="${esc(Store.get("tf-name", ""))}" placeholder="Alex" autocomplete="given-name"></label>
          <p class="muted small">Stored on this device only. The A1 track uses its own <a href="#/a1/about">Over mij</a> form.</p>
        </section>
        <section class="form">
          <h2>Voice</h2>
          <label>Speed <output id="rateout">${rate.toFixed(2)}×</output><input type="range" id="rate" min="0.5" max="1.3" step="0.05" value="${rate}"></label>
          <div id="voices" class="small"></div>
          <div class="actions"><button class="btn ghost" data-test="nl">${I.play} Test Dutch</button><button class="btn ghost" data-test="fr">${I.play} Test French</button>
          ${Speech.canListen ? `<button class="btn ghost" data-mic>${I.mic} Test microphone</button>` : ""}</div>
          <div id="mictest"></div>
          ${Speech.canListen ? "" : `<p class="muted small">This browser has no speech recognition, so "Say it" scores are hidden. Safari on iPhone and Chrome support it.</p>`}
        </section>
        <section class="form">
          <h2>Tutor and scenarios</h2>
          <label>Anthropic API key<span class="inline"><input type="password" id="key" value="${esc(AI.key())}" placeholder="sk-ant-…" autocomplete="off" spellcheck="false"><button class="btn ghost" data-reveal type="button">Show</button></span></label>
          <label>Model<input type="text" id="model" value="${esc(Store.get("tf-model", ""))}" placeholder="claude-sonnet-5-5" spellcheck="false"></label>
          <p class="muted small">The key stays in this browser and is sent only to api.anthropic.com. Use a key with a low spending limit.</p>
        </section>
        <section class="form">
          <h2>Progress</h2>
          <p class="small">Progress lives on this device. Move it to another device with a backup file.</p>
          <div class="actions"><button class="btn ghost" data-export>Save backup file</button><label class="btn ghost file">Load backup file<input type="file" id="import" accept="application/json"></label></div>
          <p id="iomsg" class="small" aria-live="polite"></p>
        </section>
        <section class="form">
          <h2>Install on iPhone</h2>
          <p class="small">In Safari, tap Share, then Add to Home Screen. TaalForge then opens full screen and works without signal (the tutor and speech scores still need internet).</p>
          <p class="muted small">TaalForge v5</p>
        </section>`,
      async mount(root) {
        const voices = () => { $("#voices", root).innerHTML = ["nl", "fr"].map(l => { const v = Speech.voiceStatus(l); return !v.supported ? "<p>This browser can't speak.</p>" : `<p>${l === "nl" ? "Dutch" : "French"}: ${v.count ? `${v.count} voice${v.count > 1 ? "s" : ""}, ${v.belgian ? "Belgian voice found" : "no Belgian voice, using " + esc(v.name)}` : "no voice installed. On iPhone: Settings, Accessibility, Spoken Content, Voices."}</p>`; }).join(""); };
        await Speech.ready(); voices();
        $("#name", root).addEventListener("input", e => Store.set("tf-name", e.target.value.trim()));
        $("#rate", root).addEventListener("input", e => { Store.set("tts-rate", e.target.value); $("#rateout", root).textContent = (+e.target.value).toFixed(2) + "×"; });
        $("#key", root).addEventListener("change", e => Store.set("tf-api-key", e.target.value.trim()));
        $("#model", root).addEventListener("change", e => Store.set("tf-model", e.target.value.trim()));
        root.addEventListener("click", async e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.test) Speech.speak(b.dataset.test === "nl" ? `Goeiemorgen ${Learner.name()}. Welkom bij TaalForge.` : `Bonjour ${Learner.name()}. Bienvenue sur TaalForge.`, b.dataset.test);
          if (b.hasAttribute("data-mic")) { $("#mictest", root).innerHTML = '<p class="muted">Say: "Goeiemorgen, hoe gaat het?"</p>'; $("#mictest", root).innerHTML = await sayScore("Goeiemorgen, hoe gaat het?", "nl"); }
          if (b.hasAttribute("data-reveal")) { const k = $("#key", root); k.type = k.type === "password" ? "text" : "password"; b.textContent = k.type === "password" ? "Show" : "Hide"; }
          if (b.hasAttribute("data-export")) {
            const keep = ["tf-lang", "tf-progress", "tf-vocab", "tts-rate", "tf-name", "tf-listen-first", "tf-a1-profile"];
            const out = {}; keep.forEach(k => { const v = Store.get(k, null); if (v !== null) out[k] = v; });
            const blob = new Blob([JSON.stringify({ app: "taalforge", v: 5, data: out }, null, 1)], { type: "application/json" });
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "taalforge-backup-" + new Date().toISOString().slice(0, 10) + ".json" });
            document.body.appendChild(a); a.click(); a.remove();
            $("#iomsg", root).textContent = "Backup saved. It holds progress and the Over mij answers, not the API key.";
          }
        });
        $("#import", root).addEventListener("change", async e => {
          const f = e.target.files[0]; if (!f) return;
          try {
            const j = JSON.parse(await f.text());
            if (j.app !== "taalforge") throw new Error();
            Object.entries(j.data).forEach(([k, v]) => Store.set(k, v));
            Progress.reload(); $("#iomsg", root).textContent = "Backup loaded."; shell();
          } catch (err) { $("#iomsg", root).textContent = "That file isn't a TaalForge backup."; }
        });
      }
    };
  });

  window.route = route;
  window.currentTrack = currentTrack;
  window.addEventListener("hashchange", dispatch);
  window.addEventListener("DOMContentLoaded", () => {
    if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("sw.js").catch(() => {});
    dispatch();
  });
})();
