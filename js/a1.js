// TaalForge v5: A1 everyday track (Zo gezegd 1.1). Units, the five blocks,
// the four new exercise types (dictation, clock, form fill, fill in the blank),
// pronunciation and the speaking-test drill.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const D = Dutch;
  const A = TF.a1;
  const BLOCKS = [["learn", "Learn"], ["listen", "Listen"], ["practise", "Practise"], ["pronounce", "Pronounce"], ["check", "Check"]];

  // ── "Over mij": personal answers, stored only in this browser
  const LANGS = [["Portugees", "Portuguese"], ["Engels", "English"], ["Frans", "French"], ["Spaans", "Spanish"], ["Arabisch", "Arabic"], ["Berbers", "Berber"], ["Turks", "Turkish"], ["Pools", "Polish"], ["Roemeens", "Romanian"], ["Russisch", "Russian"], ["Oekraïens", "Ukrainian"], ["Italiaans", "Italian"], ["Duits", "German"], ["Swahili", "Swahili"], ["Lingala", "Lingala"], ["Chinees", "Chinese"], ["Hindi", "Hindi"]];
  const STATUS = [["getrouwd", "married"], ["alleenstaand", "single"], ["gescheiden", "divorced"], ["samenwonend", "living together"]];
  const TRANSPORT = [["met de auto", "by car"], ["met de bus", "by bus"], ["met de tram", "by tram"], ["met de trein", "by train"], ["met de fiets", "by bike"], ["te voet", "on foot"]];

  const Profile = {
    get() { return Store.getJSON("tf-a1-profile", null); },
    set(p) { Store.setJSON("tf-a1-profile", p); },
    langs(p) { return [...(p.languages || []), ...String(p.langOther || "").split(",").map(s => s.trim()).filter(Boolean)]; }
  };
  const listNl = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " en " + a[a.length - 1];
  const kids = (n, one, more) => n === 1 ? "één " + one : D.num(n) + " " + more;

  // Model answers. Each returns { text, say } or { missing } when Over mij lacks the field.
  const ANSWERS = {
    howAreYou: () => ({ text: "Goed, dank je. En met jou?" }),
    name: p => p.firstName && p.lastName ? { text: `Mijn voornaam is ${p.firstName}. Mijn familienaam is ${p.lastName}.` } : { missing: true },
    spell: p => p.lastName ? { text: p.lastName.toUpperCase().split("").join("-"), say: D.spell(p.lastName), spoken: D.spell(p.lastName) } : { missing: true },
    country: p => p.country ? { text: `Ik kom uit ${p.country}.` } : { missing: true },
    languages: p => { const l = Profile.langs(p); if (!l.length) return { missing: true }; return { text: `Ik spreek ${listNl([...l.filter(x => x.toLowerCase() !== "nederlands"), "een beetje Nederlands"])}.` }; },
    town: p => p.town ? { text: `Ik woon in ${p.town}.` } : { missing: true },
    age: p => p.age ? { text: `Ik ben ${p.age} jaar.` } : { missing: true },
    married: p => { const t = { getrouwd: "Ja, ik ben getrouwd.", alleenstaand: "Nee, ik ben alleenstaand.", gescheiden: "Nee, ik ben gescheiden.", samenwonend: "Nee, ik woon samen." }[p.status]; return t ? { text: t } : { missing: true }; },
    children: p => {
      if (p.boys === "" || p.girls === "" || p.boys == null || p.girls == null) return { missing: true };
      const b = +p.boys || 0, g = +p.girls || 0, n = b + g;
      if (!n) return { text: "Nee, ik heb geen kinderen." };
      const parts = [b ? kids(b, "jongen", "jongens") : "", g ? kids(g, "meisje", "meisjes") : ""].filter(Boolean);
      return { text: n === 1 ? `Ja, ik heb één kind: ${b ? "een jongen" : "een meisje"}.` : `Ja, ik heb ${D.num(n)} kinderen: ${parts.join(" en ")}.` };
    },
    toSchool: p => p.toSchool ? { text: `Ik kom ${p.toSchool} naar school.` } : { missing: true },
    toShop: p => p.toShop ? { text: `Ik ga ${p.toShop} naar de supermarkt.` } : { missing: true },
    belgium: p => {
      if (!p.since) return { missing: true };
      const n = new Date().getFullYear() - +p.since;
      return { text: n <= 0 ? "Ik woon nog geen jaar in België." : n === 1 ? "Ik woon al één jaar in België." : `Ik woon al ${n} jaar in België.` };
    },
    weather: () => ({ text: "Het is bewolkt. Het is twaalf graden.", example: true }),
    time: () => { const d = new Date(); let m = Math.round(d.getMinutes() / 5) * 5, h = d.getHours(); if (m === 60) { m = 0; h++; } return { text: `Het is ${D.time(h, m)}.`, live: true }; }
  };
  function modelAnswer(key) { const p = Profile.get() || {}; return ANSWERS[A.questions[key].answer](p); }

  // ── Generators for dictation and clock items
  const NAMES = ["Peeters", "Janssens", "Maes", "Jacobs", "Willems", "Claes", "Goossens", "Wouters", "Vermeulen", "Geerts", "Verhoeven", "Gielen", "Jef", "Veerle", "Wim", "Evi", "Ilse", "Gert", "Jens", "Lies", "Wauters", "Vogels"];
  const STEPS = [0, 15, 30, 45, 20, 40, 0, 15, 30, 45, 5, 10, 25, 35, 50, 55];
  function genNumber() {
    const pool = D.pick([[13, 14, 15, 16, 17, 18, 19], [30, 40, 50, 60, 70, 80, 90], [21, 22, 23, 32, 33, 42, 43, 52, 53, 62, 72, 82, 92, 98], [0, 7, 11, 12, 100]]);
    const n = D.pick(pool.length > 6 && pool[0] === 21 ? pool.concat(Array.from({ length: 8 }, () => 21 + Math.floor(Math.random() * 78))) : pool);
    return { kind: "dict", mode: "number", say: D.num(n, true), answer: String(n), spoken: D.num(n), prompt: "Type the number you hear (digits are fine).", check: v => D.parseNumber(v) === n };
  }
  function genPrice() {
    const r = Math.random();
    const cents = r < 0.12 ? 50 : r < 0.24 ? 150 : (1 + Math.floor(Math.random() * 99)) * 100 + D.pick([0, 0, 50, 50, 25, 75, 10, 20, 90, 95, 99]);
    const say = D.price(cents, Math.random() < 0.4);
    return { kind: "dict", mode: "price", say, answer: D.priceLabel(cents), spoken: say, prompt: "Type the price you hear, like 3,50.", check: v => D.parsePrice(v) === cents };
  }
  function genSpell() {
    const name = D.pick(NAMES);
    return { kind: "dict", mode: "spell", say: D.spell(name), rate: 0.7, answer: name, spoken: D.spell(name), prompt: "Type the name you hear spelled.", check: v => D.plain(v).replace(/\s/g, "") === D.plain(name).toLowerCase() };
  }
  function genTime() {
    const h = 1 + Math.floor(Math.random() * 12), m = D.pick(STEPS);
    const phrase = D.time(h, m);
    return { kind: "dict", mode: "time", say: "Het is " + phrase + ".", answer: `${h}:${D.pad(m)}`, spoken: phrase, prompt: "Type the time you hear, like 8:40.", check: v => D.sameClock(D.parseTime(v), { h, m }) || D.plain(v).replace(/^het is /, "") === D.plain(phrase) };
  }
  function genClock() {
    const h = 1 + Math.floor(Math.random() * 12), m = D.pick(STEPS);
    const right = D.time(h, m);
    const cands = [D.time(h - 1, m), D.time(h + 1, m), D.time(h, (60 - m) % 60), D.time(h, (m + 30) % 60), D.time(h, (m + 15) % 60)];
    const wrong = D.shuffle([...new Set(cands)].filter(x => x !== right)).slice(0, 3);
    const options = D.shuffle([right, ...wrong]);
    return { kind: "clock", h, m, options, a: options.indexOf(right) };
  }
  const GEN = { number: genNumber, price: genPrice, spell: genSpell, time: genTime };

  function setItems(unit, set) {
    if (set.type === "fill") return D.shuffle(set.items).map(i => ({ kind: "fill", ...i }));
    if (set.type === "choice") return set.items.map(i => ({ kind: "choice", ...i, board: i.board ? unit.board : null }));
    if (set.type === "dictation") return Array.from({ length: set.n }, () => GEN[set.mode]());
    if (set.type === "clock") return Array.from({ length: set.n }, genClock);
    return [];
  }
  function checkItems(unit) {
    const out = [];
    for (const c of unit.check) {
      if (GEN[c.from]) { for (let i = 0; i < c.n; i++) out.push(GEN[c.from]()); continue; }
      const pool = unit.practise.filter(s => s.type === c.from).flatMap(s => setItems(unit, s));
      out.push(...D.shuffle(pool).slice(0, c.n));
    }
    return out;
  }

  // ── Clock face
  function clockSVG(h, m) {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, r1 = i % 3 ? 50 : 46; return `<line x1="${60 + r1 * Math.sin(a)}" y1="${60 - r1 * Math.cos(a)}" x2="${60 + 54 * Math.sin(a)}" y2="${60 - 54 * Math.cos(a)}"/>`; }).join("");
    return `<svg class="clock" viewBox="0 0 120 120" role="img" aria-label="Clock showing ${h}:${D.pad(m)}">
      <circle cx="60" cy="60" r="57" class="face"/><g class="ticks">${ticks}</g>
      <line x1="60" y1="60" x2="${60 + 30 * Math.sin(ha * Math.PI / 180)}" y2="${60 - 30 * Math.cos(ha * Math.PI / 180)}" class="hour"/>
      <line x1="60" y1="60" x2="${60 + 45 * Math.sin(ma * Math.PI / 180)}" y2="${60 - 45 * Math.cos(ma * Math.PI / 180)}" class="minute"/>
      <circle cx="60" cy="60" r="3.5" class="pin"/></svg>`;
  }
  function boardHTML(rows) {
    return `<div class="board" role="table" aria-label="Departure board"><div class="board-row head" role="row"><span role="columnheader">Vertrek</span><span role="columnheader">Bestemming</span><span role="columnheader">Spoor</span><span role="columnheader">Vertraging</span></div>
      ${rows.map(r => `<div class="board-row" role="row"><span role="cell">${r.time}</span><span role="cell">${r.dest}</span><span role="cell">${r.track}</span><span role="cell">${r.delay || "–"}</span></div>`).join("")}</div>`;
  }

  // ── Exercise runner (Practise sets and Check)
  function Runner(el, items, { onDone, doneHref }) {
    const s = { i: 0, score: 0, answered: false, fb: "", chosen: null };
    function fill(it, answer) { return esc(it.s).replace("___", answer == null ? "<input type=\"text\" id=\"blank\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" aria-label=\"Missing word\">" : `<u>${esc(answer)}</u>`); }
    function draw() {
      if (s.i >= items.length) {
        const pass = s.score >= Math.ceil(items.length * 0.7);
        el.innerHTML = `<div class="sheet result"><p class="grade${pass ? " pass" : ""}">${s.score}/${items.length}</p>
          <p>${pass ? "Goed gedaan!" : "Keep going: try the set again."}</p>
          <div class="actions"><button class="btn" data-a="again">Again</button><a class="btn ghost" href="${doneHref}">Back</a></div></div>`;
        onDone && onDone(s.score, items.length);
        return;
      }
      const it = items[s.i];
      let body = "";
      if (it.kind === "fill") {
        body = `<p class="target fillin" lang="nl">${fill(it, s.answered ? it.a[0] : null)}</p>
          ${it.hint ? `<p class="hint">(${esc(it.hint)})</p>` : ""}
          ${s.answered ? `<p class="trans">${esc(it.en || "")}</p>` : ""}`;
      } else if (it.kind === "choice") {
        body = `${it.board ? boardHTML(it.board) : ""}
          ${it.hideQ && !s.answered ? `<p class="muted">Listen, then choose.</p>` : `<p class="target${it.big ? " emoji" : ""}" lang="nl">${esc(it.q)}</p>`}
          ${it.say ? `<button class="btn ghost" data-a="sayq">${I.play} Listen</button>` : ""}
          <div class="options">${it.options.map((o, k) => `<button class="option${s.answered && k === it.a ? " right" : ""}${s.answered && k === s.chosen && k !== it.a ? " wrong" : ""}" data-o="${k}" ${s.answered ? "disabled" : ""} lang="nl">${esc(o)}</button>`).join("")}</div>`;
      } else if (it.kind === "dict") {
        body = `<p class="muted">${esc(it.prompt)}</p>
          <div class="listen-row"><button class="btn big-play" data-a="sayd">${I.play} Listen</button><button class="btn ghost" data-a="slow">Slower</button></div>
          <input type="text" id="dict" inputmode="${it.mode === "spell" ? "text" : "decimal"}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" ${s.answered ? "disabled" : ""}>
          ${s.answered ? `<p class="trans">${esc(it.answer)}: <span lang="nl">${esc(it.spoken)}</span></p>` : ""}`;
      } else if (it.kind === "clock") {
        body = `${clockSVG(it.h, it.m)}<p class="muted">Hoe laat is het?</p>
          <div class="options">${it.options.map((o, k) => `<button class="option${s.answered && k === it.a ? " right" : ""}${s.answered && k === s.chosen && k !== it.a ? " wrong" : ""}" data-o="${k}" ${s.answered ? "disabled" : ""} lang="nl">${esc(o)}</button>`).join("")}</div>`;
      }
      const needsCheck = (it.kind === "fill" || it.kind === "dict") && !s.answered;
      el.innerHTML = `<div class="sheet exercise">
        <div class="row-between small muted"><span>${s.i + 1} of ${items.length}</span><span>${s.score} right</span></div>
        <div class="bar"><i style="width:${(s.i / items.length) * 100}%"></i></div>
        ${body}
        <p class="feedback" aria-live="polite">${s.fb}</p>
        <div class="actions">${needsCheck ? `<button class="btn" data-a="check">Check</button>` : s.answered ? `<button class="btn" data-a="next">${s.i < items.length - 1 ? "Next" : "See score"}</button>` : ""}</div></div>`;
      const inp = $("#blank", el) || $("#dict", el);
      if (inp && !s.answered) { inp.focus({ preventScroll: true }); inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); }); }
      const nx = $("[data-a=next]", el); if (nx) nx.focus({ preventScroll: true });
    }
    function mark(ok, extra) {
      s.answered = true; if (ok) s.score++;
      s.fb = ok ? `<span class="red-tick">${I.tick}</span> ${extra || D.pick(["Goed zo!", "Juist!", "Prima!"])}` : `<span class="red-x">✗</span> ${extra || ""}`;
    }
    function check() {
      const it = items[s.i];
      if (it.kind === "fill") {
        const raw = ($("#blank", el).value || "").trim().toLowerCase().replace(/[.,!?]+$/, "");
        if (!raw) return;
        const exact = it.a.includes(raw);
        const near = it.near && it.near[raw];
        const loose = !exact && it.a.some(x => D.plain(x) === D.plain(raw));
        if (exact) mark(true, it.tip ? esc(it.tip) : null);
        else if (near) mark(false, esc(near));
        else if (loose) mark(true, `Watch the spelling: <b lang="nl">${esc(it.a[0])}</b>`);
        else mark(false, `It's <b lang="nl">${esc(it.a[0])}</b>.${it.tip ? " " + esc(it.tip) : ""}`);
        Speech.speak(it.s.replace("___", it.a[0]), "nl");
      } else if (it.kind === "dict") {
        const v = $("#dict", el).value.trim(); if (!v) return;
        const ok = it.check(v);
        mark(ok, ok ? null : `You wrote ${esc(v)}.`);
      }
      draw();
    }
    function sayItem(slow) {
      const it = items[s.i]; if (!it) return;
      if (it.kind === "dict") Speech.speak(it.say, "nl", { rate: slow ? 0.6 : it.rate });
      if (it.kind === "choice" && it.say) Speech.speak(typeof it.say === "string" ? it.say : it.q, "nl");
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const a = b.dataset.a;
      if (a === "check") check();
      if (a === "next") { s.i++; s.answered = false; s.fb = ""; s.chosen = null; draw(); sayItem(); }
      if (a === "sayd" || a === "sayq") sayItem();
      if (a === "slow") sayItem(true);
      if (a === "again") { s.i = 0; s.score = 0; s.answered = false; s.fb = ""; items = items.map(x => x.kind === "dict" ? GEN[x.mode]() : x.kind === "clock" ? genClock() : x); if (items[0].kind === "fill") items = D.shuffle(items); draw(); }
      if (b.dataset.o != null && !s.answered) {
        const it = items[s.i]; s.chosen = +b.dataset.o;
        mark(s.chosen === it.a, s.chosen === it.a ? null : `It's <b lang="nl">${esc(it.options[it.a])}</b>.`);
        draw();
      }
    });
    draw();
  }

  // ── Form fill: a Dutch registration form, checked against Over mij
  function FormFill(el, onDone, doneHref) {
    const p = Profile.get();
    if (!p || !p.firstName) { el.innerHTML = `<div class="sheet"><p>This exercise checks your answers against the Over mij form. Fill that in first.</p><a class="btn" href="#/a1/about">Open Over mij</a></div>`; return; }
    const fields = D.shuffle([
      { k: "firstName", label: "Voornaam" }, { k: "lastName", label: "Familienaam" }, { k: "age", label: "Leeftijd", type: "number" },
      { k: "town", label: "Gemeente" }, { k: "country", label: "Land" },
      { k: "status", label: "Burgerlijke staat", radio: STATUS.map(s => s[0]) },
      { k: "boys", label: "Aantal jongens", type: "number" }, { k: "girls", label: "Aantal meisjes", type: "number" },
      { k: "toSchool", label: "Hoe kom je naar school?", select: TRANSPORT.map(t => t[0]) }
    ]);
    el.innerHTML = `<form class="sheet regform" novalidate><h2 class="formtitle" lang="nl">Inschrijvingsformulier</h2>
      ${fields.map(f => f.radio ? `<fieldset data-k="${f.k}"><legend lang="nl">${f.label}</legend>${f.radio.map(r => `<label class="radio"><input type="radio" name="${f.k}" value="${r}"> <span lang="nl">${r}</span></label>`).join("")}<span class="fieldmark"></span></fieldset>`
        : f.select ? `<label data-k="${f.k}"><span lang="nl">${f.label}</span><select name="${f.k}"><option value="">…</option>${f.select.map(o => `<option lang="nl">${o}</option>`).join("")}</select><span class="fieldmark"></span></label>`
        : `<label data-k="${f.k}"><span lang="nl">${f.label}</span><input name="${f.k}" type="${f.type || "text"}" autocomplete="off" autocapitalize="words"><span class="fieldmark"></span></label>`).join("")}
      <div class="actions"><button class="btn">Check the form</button><a class="btn ghost" href="${doneHref}">Back</a></div><p class="feedback" aria-live="polite"></p></form>`;
    $("form", el).addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(e.target); let right = 0;
      fields.forEach(f => {
        const got = D.plain(fd.get(f.k) || ""), want = D.plain(String(p[f.k] == null ? "" : p[f.k]));
        const ok = got !== "" && (got === want || (f.type === "number" && +got === +want));
        if (ok) right++;
        const mk = $(`[data-k="${f.k}"] .fieldmark`, el);
        mk.innerHTML = ok ? `<span class="red-tick">${I.tick}</span>` : `<span class="red-x">✗</span> <span class="small">${esc(String(p[f.k] ?? ""))}</span>`;
      });
      $(".feedback", el).innerHTML = `${right} of ${fields.length} right.${right === fields.length ? " Goed gedaan!" : " The red marks show what Over mij says."}`;
      onDone(right, fields.length);
    });
  }

  // ── Question card for speaking practice
  function questionCard(key) {
    const q = A.questions[key], ans = modelAnswer(key);
    return `<li class="qcard" data-q="${key}">
      <div class="row"><button class="icon-btn" data-a="q" aria-label="Play the question">${I.play}</button><div class="grow"><p class="target small-target" lang="nl">${esc(q.q)}</p><p class="muted small">${esc(q.en)}</p></div></div>
      ${ans.missing ? `<p class="small">Your answer appears after you fill in <a href="#/a1/about">Over mij</a>.</p>`
        : `<details class="model"><summary>${ans.example ? "Example answer" : "Your answer"}</summary><p lang="nl">${esc(ans.text)} <button class="icon-btn" data-a="a" aria-label="Play the answer">${I.play}</button></p></details>
           ${Speech.canListen ? `<button class="btn ghost" data-a="mic">${I.mic} Answer out loud</button><div class="say-result"></div>` : ""}`}
    </li>`;
  }
  function bindQuestions(root) {
    root.addEventListener("click", async e => {
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const li = b.closest("[data-q]"); if (!li) return;
      const key = li.dataset.q, ans = modelAnswer(key);
      if (b.dataset.a === "q") Speech.speak(A.questions[key].q, "nl");
      if (b.dataset.a === "a") Speech.speak(ans.say || ans.text, "nl", { rate: ans.say ? 0.7 : undefined });
      if (b.dataset.a === "mic") {
        const out = $(".say-result", li); out.innerHTML = '<span class="muted">Listening…</span>';
        out.innerHTML = await sayScore(ans.spoken || ans.text, "nl");
      }
    });
  }

  const unitById = id => A.units.find(u => u.id === id);
  function practiseDone(u) { const p = Progress.unit(u.id); return u.practise.every((_, i) => p.practise[i] != null); }
  function blockDone(u, b) { const p = Progress.unit(u.id); return b === "practise" ? practiseDone(u) : b === "check" ? (p.check || 0) >= 7 : !!p[b]; }

  // ── Routes
  route("/a1", () => {
    const prof = Profile.get();
    return `
      <section class="intro">
        <h1>Nederlands A1, the Zo gezegd way</h1>
        <p class="lede">One unit per part of the book, each with the same five steps: learn, listen, practise, pronounce, check.</p>
        ${prof && prof.firstName ? `<p class="small">Answers set for ${esc(prof.firstName)}. <a href="#/a1/about">Edit Over mij</a></p>`
          : `<a class="continue" href="#/a1/about"><span class="small muted">Start here</span><span class="title">Fill in Over mij</span><span class="sub">Your answers for the speaking test. Saved only on this phone.</span></a>`}
      </section>
      <section><h2>Units</h2><ul class="rows units">${A.units.map(u => `<li><a class="lesson-row" href="#/a1/unit/${u.id}">
        <span class="num">${u.num}</span>
        <span class="grow"><span class="title" lang="nl">${esc(u.title)}</span><span class="sub">${esc(u.summary)}</span>
        <span class="steps" aria-label="Steps done">${BLOCKS.map(([b, l]) => `<i class="${blockDone(u, b) ? "on" : ""}" title="${l}"></i>`).join("")}</span></span></a></li>`).join("")}</ul>
        <p class="muted small">Parts 5 and up are added as the class reaches them.</p></section>
      <section><a class="continue" href="#/a1/speak"><span class="small muted">Speaking test</span><span class="title">Practise the teacher's questions</span><span class="sub">Hear each question and answer out loud.</span></a></section>`;
  });

  route("/a1/unit/([^/]+)", id => {
    const u = unitById(id); if (!u) return `<p>Unit not found. <a href="#/a1">Back</a></p>`;
    const p = Progress.unit(u.id);
    return `
      <a class="back" href="#/a1">${I.back} Units</a>
      <header class="lesson-head"><p class="small muted">Deel ${u.num}</p><h1 lang="nl">${esc(u.title)}</h1><p class="sub">${esc(u.titleEn)}</p></header>
      <ol class="blocks">${BLOCKS.map(([b, l], i) => `<li><a href="#/a1/unit/${u.id}/${b}" class="block-row">
        <span class="num">${i + 1}</span><span class="grow"><span class="title">${l}</span><span class="sub">${{
          learn: "Notes for this part of the book",
          listen: "Hear each sentence before you see it",
          practise: `${u.practise.length} exercises: ` + [...new Set(u.practise.map(s => ({ fill: "fill in the blank", choice: "choose the answer", dictation: "dictation", clock: "clock", form: "form fill" }[s.type])))].join(", "),
          pronounce: "Sound pairs and test questions",
          check: "Ten questions in the test's format" + (p.check != null ? `. Best: ${p.check}/10` : "")
        }[b]}</span></span>${blockDone(u, b) ? `<span class="mark">${I.tick}</span>` : ""}</a></li>`).join("")}</ol>
      <section class="extras"><h2>Book and extras</h2>
        <p><a href="${A.portal}" target="_blank" rel="noopener">Zo gezegd 1.1 audio and extra exercises</a><br><span class="muted small">Log in with the code on page 2 of the book, then open deel ${u.num}.</span></p>
        ${A.extras.map(x => `<p><a href="${x.url}" target="_blank" rel="noopener">${esc(x.title)}</a><br><span class="muted small">${esc(x.note)}</span></p>`).join("")}
      </section>`;
  });

  route("/a1/unit/([^/]+)/learn", id => {
    const u = unitById(id);
    return {
      html: `<a class="back" href="#/a1/unit/${u.id}">${I.back} Deel ${u.num}</a><h1>Learn</h1><p class="lede" lang="nl">${esc(u.title)}</p>
        ${u.learn.map(sec => `<section class="notes"><h2>${esc(sec.h)}</h2><ul>${sec.rows.map(([nl, en]) => `<li><button class="icon-btn" data-say="${esc(nl.replace(/·/g, ","))}" aria-label="Play">${I.play}</button><span class="grow"><span lang="nl">${esc(nl)}</span>${en ? `<span class="muted">${esc(en)}</span>` : ""}</span></li>`).join("")}</ul>${sec.note ? `<p class="tip">${esc(sec.note)}</p>` : ""}</section>`).join("")}
        <div class="actions"><button class="btn" data-done>I've read this</button></div>`,
      mount(root) {
        root.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.say) Speech.speak(b.dataset.say, "nl");
          if (b.hasAttribute("data-done")) { Progress.markBlock(u.id, "learn", true); go("#/a1/unit/" + u.id); }
        });
      }
    };
  });

  route("/a1/unit/([^/]+)/listen", id => {
    const u = unitById(id);
    return {
      html: `<a class="back" href="#/a1/unit/${u.id}">${I.back} Deel ${u.num}</a><h1>Listen</h1><p class="lede">Play each sentence, say it after the voice, then check the meaning.</p><div id="pl"></div>
        <p class="small">Then the book's own audio for deel ${u.num}: <a href="${A.portal}" target="_blank" rel="noopener">open the Zo gezegd portal</a>.</p>`,
      mount(root) {
        Player($("#pl", root), { sentences: u.listen, lang: "nl", listenFirst: Store.get("tf-a1-listen-first", "1") === "1", listenKey: "tf-a1-listen-first", finishLabel: "Done listening", onFinish() { Progress.markBlock(u.id, "listen", true); go("#/a1/unit/" + u.id); } });
      }
    };
  });

  route("/a1/unit/([^/]+)/practise", id => {
    const u = unitById(id), p = Progress.unit(u.id);
    return `<a class="back" href="#/a1/unit/${u.id}">${I.back} Deel ${u.num}</a><h1>Practise</h1>
      <ul class="rows">${u.practise.map((s, i) => `<li><a class="lesson-row" href="#/a1/unit/${u.id}/practise/${i}"><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${{ fill: "Fill in the blank", choice: "Choose the answer", dictation: "Dictation", clock: "Clock", form: "Form fill" }[s.type]}${p.practise[i] != null ? ` · best ${Math.round(p.practise[i] * 100)}%` : ""}</span></span>${p.practise[i] != null ? `<span class="mark">${I.tick}</span>` : ""}</a></li>`).join("")}</ul>
      <p class="muted small">More drills on the same topics: <a href="${A.extras[0].url}" target="_blank" rel="noopener">${esc(A.extras[0].title)}</a>.</p>`;
  });

  route("/a1/unit/([^/]+)/practise/(\\d+)", (id, n) => {
    const u = unitById(id), set = u.practise[+n];
    if (!set) return `<p>Exercise not found. <a href="#/a1/unit/${id}/practise">Back</a></p>`;
    const back = `#/a1/unit/${u.id}/practise`;
    return {
      html: `<a class="back" href="${back}">${I.back} Practise</a><h1>${esc(set.title)}</h1><div id="ex"></div>`,
      mount(root) {
        const done = (sc, tot) => Progress.practiseSet(u.id, +n, sc, tot);
        if (set.type === "form") FormFill($("#ex", root), done, back);
        else Runner($("#ex", root), setItems(u, set), { onDone: done, doneHref: back });
      }
    };
  });

  route("/a1/unit/([^/]+)/pronounce", id => {
    const u = unitById(id);
    const words = u.pronounce.pairs.flat();
    return {
      html: `<a class="back" href="#/a1/unit/${u.id}">${I.back} Deel ${u.num}</a><h1>Pronounce</h1>
        <section><h2>Hear the difference</h2>
          <ul class="pairs">${u.pronounce.pairs.map(pr => `<li>${pr.map(w => `<button class="pairword" data-say="${esc(w)}" lang="nl">${I.play} ${esc(w)}</button>`).join("")}</li>`).join("")}</ul>
          <div id="game" class="sheet"></div></section>
        ${Speech.canListen ? `<section><h2>Say it</h2><ul class="sayit">${words.map(w => `<li><span lang="nl">${esc(w)}</span><button class="btn ghost" data-mic="${esc(w)}">${I.mic} Say it</button><div class="say-result"></div></li>`).join("")}</ul></section>` : ""}
        <section><h2>Test questions</h2><ul class="qlist">${u.pronounce.questions.map(questionCard).join("")}</ul></section>`,
      mount(root) {
        const g = { round: 0, score: 0, word: null, res: "" }, ROUNDS = 6;
        const game = $("#game", root);
        const next = () => { const pr = D.pick(u.pronounce.pairs); g.pair = pr; g.word = D.pick(pr); g.res = ""; drawGame(); };
        function drawGame() {
          if (g.round >= ROUNDS) {
            game.innerHTML = `<p class="grade${g.score >= 5 ? " pass" : ""}">${g.score}/${ROUNDS}</p><div class="actions"><button class="btn ghost" data-g="again">Play again</button></div>`;
            Progress.markBlock(u.id, "pronounce", true); return;
          }
          game.innerHTML = g.word ? `<p class="small muted">Which word do you hear? ${g.round + 1} of ${ROUNDS}</p>
            <div class="listen-row"><button class="btn big-play" data-g="play">${I.play} Listen</button></div>
            <div class="options two">${g.pair.map(w => `<button class="option" data-g="pick" data-w="${esc(w)}" lang="nl" ${g.res ? "disabled" : ""}>${esc(w)}</button>`).join("")}</div>
            <p class="feedback" aria-live="polite">${g.res}</p>${g.res ? `<div class="actions"><button class="btn" data-g="next">Next</button></div>` : ""}`
            : `<p>Which word do you hear? ${ROUNDS} rounds.</p><button class="btn" data-g="start">Start</button>`;
        }
        root.addEventListener("click", async e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.say) Speech.speak(b.dataset.say, "nl", { rate: 0.8 });
          if (b.dataset.g === "start" || b.dataset.g === "again") { g.round = 0; g.score = 0; next(); Speech.speak(g.word, "nl", { rate: 0.8 }); }
          if (b.dataset.g === "play") Speech.speak(g.word, "nl", { rate: 0.8 });
          if (b.dataset.g === "pick") { const ok = b.dataset.w === g.word; if (ok) g.score++; g.res = ok ? `<span class="red-tick">${I.tick}</span> Juist!` : `<span class="red-x">✗</span> It was <b lang="nl">${esc(g.word)}</b>.`; drawGame(); }
          if (b.dataset.g === "next") { g.round++; if (g.round < ROUNDS) { next(); Speech.speak(g.word, "nl", { rate: 0.8 }); } else drawGame(); }
          if (b.dataset.mic) { const out = b.nextElementSibling; out.innerHTML = '<span class="muted">Listening…</span>'; out.innerHTML = await sayScore(b.dataset.mic, "nl"); }
        });
        bindQuestions($(".qlist", root));
        drawGame();
      }
    };
  });

  route("/a1/unit/([^/]+)/check", id => {
    const u = unitById(id), back = "#/a1/unit/" + u.id;
    const best = Progress.unit(u.id).check;
    return {
      html: `<a class="back" href="${back}">${I.back} Deel ${u.num}</a><h1>Check</h1><p class="lede">Ten questions in the test's format. Seven right completes the unit.${best != null ? ` Your best: ${best}/10.` : ""}</p><div id="ex"></div>`,
      mount(root) { Runner($("#ex", root), checkItems(u), { onDone: sc => Progress.checkScore(u.id, sc), doneHref: back }); }
    };
  });

  // Speaking test: the teacher's question bank, in order.
  const ORDER = ["name", "spell", "country", "languages", "town", "age", "married", "children", "toSchool", "toShop", "belgium", "howAreYou", "weather", "time"];
  route("/a1/speak", () => ({
    html: `<h1>Speaking test</h1>
      <p class="lede">Hear each question and answer out loud. Your answers come from Over mij.</p>
      <div class="sheet run"><p class="small">Exam run: each question plays, then you have eight seconds to answer before the next one.</p>
        <div class="actions"><button class="btn" data-run>${I.play} Start the exam run</button><button class="btn ghost" data-stop hidden>${I.stop} Stop</button></div><p id="runq" class="target" lang="nl" aria-live="polite"></p></div>
      <ul class="qlist">${ORDER.map(questionCard).join("")}</ul>`,
    mount(root) {
      bindQuestions($(".qlist", root));
      let running = false;
      const out = $("#runq", root), startB = $("[data-run]", root), stopB = $("[data-stop]", root);
      startB.addEventListener("click", async () => {
        running = true; startB.hidden = true; stopB.hidden = false;
        for (const k of D.shuffle(ORDER)) {
          if (!running) break;
          out.textContent = A.questions[k].q;
          await Speech.speakAsync(A.questions[k].q, "nl");
          for (let s = 8; s > 0 && running; s--) { out.textContent = `${A.questions[k].q}  (${s})`; await new Promise(r => setTimeout(r, 1000)); }
        }
        out.textContent = running ? "Klaar! Check your answers below." : "";
        running = false; startB.hidden = false; stopB.hidden = true;
      });
      stopB.addEventListener("click", () => { running = false; Speech.stop(); });
    }
  }));

  // Over mij form
  route("/a1/about", () => {
    const p = Profile.get() || {};
    const sel = (name, opts, val) => `<select name="${name}"><option value="">Choose</option>${opts.map(([nl, en]) => `<option value="${nl}" ${val === nl ? "selected" : ""}>${nl} (${en})</option>`).join("")}</select>`;
    return {
      html: `<h1>Over mij</h1>
        <p class="lede">Your answers for the speaking test. They are saved only in this phone's browser, never in the app's code.</p>
        <form class="form sheet" id="about" autocomplete="off">
          <label>Voornaam <span class="muted">(first name)</span><input name="firstName" value="${esc(p.firstName || "")}" autocapitalize="words"></label>
          <label>Familienaam <span class="muted">(surname)</span><input name="lastName" value="${esc(p.lastName || "")}" autocapitalize="words"></label>
          <label>Leeftijd <span class="muted">(age)</span><input name="age" type="number" min="16" max="99" inputmode="numeric" value="${esc(p.age || "")}"></label>
          <label>Gemeente <span class="muted">(town where you live)</span><input name="town" value="${esc(p.town || "")}" autocapitalize="words"></label>
          <label>Land <span class="muted">(country you come from, in Dutch: Portugal, Brazilië, Marokko…)</span><input name="country" value="${esc(p.country || "")}" autocapitalize="words"></label>
          <fieldset><legend>Talen <span class="muted">(languages you speak; Nederlands is added for you)</span></legend>
            <div class="checks">${LANGS.map(([nl, en]) => `<label class="check"><input type="checkbox" name="languages" value="${nl}" ${(p.languages || []).includes(nl) ? "checked" : ""}> <span lang="nl">${nl}</span> <span class="muted small">${en}</span></label>`).join("")}</div>
            <label>Other languages, in Dutch, separated by commas<input name="langOther" value="${esc(p.langOther || "")}"></label></fieldset>
          <fieldset><legend>Burgerlijke staat <span class="muted">(marital status)</span></legend>
            ${STATUS.map(([nl, en]) => `<label class="radio"><input type="radio" name="status" value="${nl}" ${p.status === nl ? "checked" : ""}> <span lang="nl">${nl}</span> <span class="muted small">${en}</span></label>`).join("")}</fieldset>
          <div class="two-col"><label>Jongens <span class="muted">(boys)</span><input name="boys" type="number" min="0" max="15" inputmode="numeric" value="${esc(p.boys ?? "")}"></label>
          <label>Meisjes <span class="muted">(girls)</span><input name="girls" type="number" min="0" max="15" inputmode="numeric" value="${esc(p.girls ?? "")}"></label></div>
          <label>Naar school <span class="muted">(how you get to class)</span>${sel("toSchool", TRANSPORT, p.toSchool)}</label>
          <label>Naar de supermarkt <span class="muted">(how you go shopping)</span>${sel("toShop", TRANSPORT, p.toShop)}</label>
          <label>In België sinds <span class="muted">(year you came to Belgium)</span><input name="since" type="number" min="1950" max="${new Date().getFullYear()}" inputmode="numeric" value="${esc(p.since || "")}"></label>
          <div class="actions"><button class="btn">Save on this phone</button></div>
          <p class="feedback" aria-live="polite"></p>
        </form>
        <section id="preview"></section>`,
      mount(root) {
        const preview = () => {
          if (!Profile.get()) return;
          $("#preview", root).innerHTML = `<h2>Your model answers</h2><ul class="answers">${ORDER.filter(k => k !== "time" && k !== "weather").map(k => { const a = modelAnswer(k); return `<li><span class="muted small" lang="nl">${esc(A.questions[k].q)}</span><span lang="nl">${a.missing ? '<span class="muted">Not filled in yet</span>' : esc(a.text)}</span></li>`; }).join("")}</ul>`;
        };
        $("#about", root).addEventListener("submit", e => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const prof = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "languages").map(([k, v]) => [k, String(v).trim()]));
          prof.languages = fd.getAll("languages");
          Profile.set(prof);
          $(".feedback", root).innerHTML = `<span class="red-tick">${I.tick}</span> Saved on this phone.`;
          preview();
        });
        preview();
      }
    };
  });

  window.A1 = { Profile, modelAnswer, genClock, genTime, genPrice, genNumber, genSpell, checkItems };
})();
