// TaalForge v5: Dutch helpers for the A1 track. Numbers, clock times, prices,
// spelling with the book's letter names, and forgiving answer checks.
window.Dutch = (function () {
  const UNITS = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien",
    "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien"];
  const TENS = { 2: "twintig", 3: "dertig", 4: "veertig", 5: "vijftig", 6: "zestig", 7: "zeventig", 8: "tachtig", 9: "negentig" };
  const LETTERS = { a: "aa", b: "bee", c: "see", d: "dee", e: "ee", f: "ef", g: "gee", h: "haa", i: "ie", j: "jee",
    k: "kaa", l: "el", m: "em", n: "en", o: "oo", p: "pee", q: "kuu", r: "er", s: "es", t: "tee", u: "uu",
    v: "vee", w: "wee", x: "iks", y: "ipsilon", z: "zet" };

  // 0–100 in words. stressOne gives "één" when the number stands alone, so TTS doesn't read it as "a".
  function num(n, stressOne) {
    if (n === 1 && stressOne) return "één";
    if (n < 20) return UNITS[n];
    if (n === 100) return "honderd";
    const t = Math.floor(n / 10), u = n % 10;
    if (!u) return TENS[t];
    const unit = UNITS[u];
    return unit + (/e$/.test(unit) ? "ën" : "en") + TENS[t];
  }

  function hourWord(h) { const x = h % 12 || 12; return num(x, true); }

  // The book's way: kwart over, twintig over, half, twintig voor, kwart voor. m in 5-minute steps.
  function time(h, m) {
    const H = hourWord(h), N = hourWord(h + 1);
    switch (m) {
      case 0: return H + " uur";
      case 5: return "vijf over " + H;
      case 10: return "tien over " + H;
      case 15: return "kwart over " + H;
      case 20: return "twintig over " + H;
      case 25: return "vijf voor half " + N;
      case 30: return "half " + N;
      case 35: return "vijf over half " + N;
      case 40: return "twintig voor " + N;
      case 45: return "kwart voor " + N;
      case 50: return "tien voor " + N;
      case 55: return "vijf voor " + N;
    }
    return H + " uur " + num(m);
  }

  function time24(h, m) { return num(h, true) + " uur" + (m ? " " + num(m) : ""); }
  function pad(m) { return String(m).padStart(2, "0"); }

  function price(cents, variant) {
    const e = Math.floor(cents / 100), c = cents % 100;
    if (e === 0 && c === 50) return "een halve euro";
    if (e === 1 && c === 50) return "anderhalve euro";
    const E = num(e, true) + " euro";
    if (!c) return E;
    if (c === 50 && variant) return E + " en half";
    return E + " " + num(c);
  }
  function priceLabel(cents) { return "€" + Math.floor(cents / 100) + "," + pad(cents % 100); }

  function spell(word) {
    return word.toLowerCase().split("").filter(ch => LETTERS[ch]).map(ch => LETTERS[ch]).join(", ");
  }

  // ── Normalising and checking
  function clean(s) {
    return String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:"“”()…—–-]/g, " ").replace(/\s+/g, " ").trim();
  }
  function plain(s) { return clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  // Replace digits with Dutch words so "34" and "vierendertig" compare equal in speech scores.
  const WORDS = {};
  for (let i = 0; i <= 100; i++) WORDS[plain(num(i))] = i;
  WORDS["een"] = 1; WORDS["één"] = 1;
  function digitsToWords(s) { return s.replace(/\b\d{1,3}\b/g, d => (+d <= 100 ? num(+d) : d)); }

  function parseNumber(input) {
    const p = plain(input);
    if (/^\d{1,3}$/.test(p)) return +p;
    return p in WORDS ? WORDS[p] : null;
  }
  function parsePrice(input) {
    let s = String(input).toLowerCase().replace(/€|euro|eur/g, "").replace(/\s/g, "").replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    return Math.round(parseFloat(s) * 100);
  }
  function parseTime(input) {
    const s = String(input).toLowerCase().replace(/\s/g, "").replace(/uur|u|h|\./g, ":").replace(/:+/g, ":").replace(/:$/, "");
    let m = s.match(/^(\d{1,2}):(\d{2})$/) || s.match(/^(\d{1,2})(\d{2})$/);
    if (m) return { h: +m[1], m: +m[2] };
    m = s.match(/^(\d{1,2})$/);
    if (m) return { h: +m[1], m: 0 };
    return null;
  }
  function sameClock(a, b) { return a && b && a.m === b.m && (a.h % 12) === (b.h % 12); }

  // Levenshtein distance on characters.
  function lev(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length];
  }

  // Speech score: 0–100, plus which target words were heard (for highlighting).
  function similarity(target, heard) {
    const t = plain(digitsToWords(target)), h = plain(digitsToWords(heard));
    if (!t) return { score: 0, words: [] };
    const score = Math.max(0, Math.round(100 * (1 - lev(t, h) / Math.max(t.length, h.length))));
    const heardWords = h.split(" ");
    const words = clean(target).split(" ").map(w => {
      const pw = plain(digitsToWords(w));
      return { w, ok: heardWords.some(x => x === pw || (pw.length > 3 && lev(x, pw) <= 1)) };
    });
    return { score, words };
  }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  return { num, time, time24, pad, price, priceLabel, spell, clean, plain, parseNumber, parsePrice, parseTime, sameClock, similarity, lev, shuffle, pick, LETTERS };
})();
