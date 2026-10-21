// TaalForge v5: speech. Text-to-speech with Belgian voice preference (as in v4)
// and speech recognition with a similarity score (restored from v3).
window.Speech = (function () {
  const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const PREFS = { nl: ["nl-BE", "nl-NL", "nl"], fr: ["fr-BE", "fr-FR", "fr-CA", "fr"] };

  function voices() { return hasTTS ? speechSynthesis.getVoices() : []; }
  function base(lang) { return lang === "fr" ? "fr" : "nl"; }

  function findVoice(lang) {
    const list = voices();
    for (const code of PREFS[base(lang)]) {
      const exact = list.find(v => v.lang.toLowerCase().replace("_", "-") === code.toLowerCase());
      if (exact) return exact;
    }
    return list.find(v => v.lang.toLowerCase().startsWith(base(lang))) || null;
  }

  function ready() {
    return new Promise(res => {
      if (!hasTTS) return res();
      if (voices().length) return res();
      speechSynthesis.onvoiceschanged = () => res();
      setTimeout(res, 1500);
    });
  }

  function rate() { const r = parseFloat(Store.get("tts-rate", "0.9")); return isNaN(r) ? 0.9 : r; }

  // speak(text, lang, {rate, onend})
  async function speak(text, lang, opts = {}) {
    if (!hasTTS) { opts.onend && opts.onend(); return; }
    speechSynthesis.cancel();
    await ready();
    const u = new SpeechSynthesisUtterance(text);
    const v = findVoice(lang);
    u.lang = v ? v.lang : (base(lang) === "fr" ? "fr-BE" : "nl-BE");
    if (v) u.voice = v;
    u.rate = opts.rate || rate();
    u.onend = () => opts.onend && opts.onend();
    u.onerror = () => opts.onend && opts.onend();
    speechSynthesis.speak(u);
  }
  function speakAsync(text, lang, opts = {}) { return new Promise(res => speak(text, lang, { ...opts, onend: res })); }
  function stop() { if (hasTTS) speechSynthesis.cancel(); }

  function voiceStatus(lang) {
    const list = voices().filter(v => v.lang.toLowerCase().startsWith(base(lang)));
    const be = list.some(v => /-be$/i.test(v.lang.replace("_", "-")));
    return { supported: hasTTS, count: list.length, belgian: be, name: (findVoice(lang) || {}).name || "" };
  }

  // Speech recognition. Resolves with the best transcript, or rejects with a readable message.
  let active = null;
  function listen(lang) {
    return new Promise((resolve, reject) => {
      if (!Rec) return reject(new Error("Speech recognition isn't available in this browser. Use Safari on iPhone or Chrome on Android/desktop."));
      stop();
      const r = new Rec();
      r.lang = base(lang) === "fr" ? "fr-BE" : "nl-BE";
      r.interimResults = false;
      r.maxAlternatives = 3;
      r.continuous = false;
      let done = false;
      r.onresult = e => { done = true; resolve(Array.from(e.results[0]).map(a => a.transcript)); };
      r.onerror = e => {
        done = true;
        const msg = {
          "not-allowed": "Microphone access is blocked. Allow it for this site in your browser settings.",
          "service-not-allowed": "Speech recognition is switched off. On iPhone, turn on Siri & Dictation in Settings.",
          "no-speech": "Nothing heard. Tap the microphone and speak straight away.",
          "network": "Speech recognition needs an internet connection."
        }[e.error] || "Speech recognition stopped (" + e.error + "). Try again.";
        reject(new Error(msg));
      };
      r.onend = () => { active = null; if (!done) reject(new Error("Nothing heard. Tap the microphone and speak straight away.")); };
      active = r;
      r.start();
    });
  }
  function cancelListen() { if (active) { try { active.abort(); } catch (e) {} active = null; } }

  return { speak, speakAsync, stop, voiceStatus, ready, listen, cancelListen, canListen: !!Rec, canSpeak: hasTTS, rate };
})();
