// TaalForge v5: storage, progress, AI client and small helpers.
// Storage keys from v4 are kept unchanged: tf-lang, tf-progress, tf-vocab, tts-rate.
window.Store = {
  get(k, dflt) { try { const v = localStorage.getItem(k); return v === null ? dflt : v; } catch (e) { return dflt; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  getJSON(k, dflt) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; } },
  setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  remove(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

// Escape for HTML; esc`` also works as a tag.
window.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Learner name for the PM and French tracks (the v4 lessons use "{name}").
window.Learner = {
  name() { return Store.get("tf-name", "") || "Alex"; },
  fill(s) { return String(s == null ? "" : s).replace(/\{name\}/g, Learner.name()); }
};

window.Progress = (function () {
  const today = () => new Date().toISOString().slice(0, 10);
  const blank = () => ({
    nl: { passiveDone: [], activeDone: [], xp: 0 },
    fr: { passiveDone: [], activeDone: [], xp: 0 },
    a1: { units: {}, xp: 0 },
    streak: 1, lastActive: today()
  });
  function load() {
    const p = Object.assign(blank(), Store.getJSON("tf-progress", {}));
    for (const k of ["nl", "fr"]) p[k] = Object.assign({ passiveDone: [], activeDone: [], xp: 0 }, p[k]);
    p.a1 = Object.assign({ units: {}, xp: 0 }, p.a1);
    return p;
  }
  let data = load();
  function save() { Store.setJSON("tf-progress", data); }
  function touch() {
    const t = today();
    if (data.lastActive === t) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    data.streak = data.lastActive === y ? (data.streak || 0) + 1 : 1;
    data.lastActive = t;
  }
  return {
    get: () => data,
    reload() { data = load(); },
    addXP(track, n) { data[track].xp = (data[track].xp || 0) + n; touch(); save(); },
    passive(id) { const t = id.slice(0, 2); if (!data[t].passiveDone.includes(id)) { data[t].passiveDone.push(id); data[t].xp += 30; touch(); save(); } },
    active(id) { const t = id.slice(0, 2); if (!data[t].activeDone.includes(id)) { data[t].activeDone.push(id); data[t].xp += 50; touch(); save(); } },
    unit(id) { return data.a1.units[id] || (data.a1.units[id] = { learn: false, listen: false, practise: {}, pronounce: false, check: null }); },
    markBlock(id, block, value) {
      const u = Progress.unit(id);
      const was = u[block];
      u[block] = value;
      if (!was && value) data.a1.xp += 20;
      touch(); save();
    },
    practiseSet(id, idx, score, total) {
      const u = Progress.unit(id);
      const best = u.practise[idx];
      if (best == null) data.a1.xp += 10;
      if (best == null || score / total > best) u.practise[idx] = score / total;
      touch(); save();
    },
    checkScore(id, score) {
      const u = Progress.unit(id);
      if (u.check == null || score > u.check) { if ((u.check || 0) < 7 && score >= 7) data.a1.xp += 50; u.check = score; }
      touch(); save();
    },
    totalXP() { return (data.nl.xp || 0) + (data.fr.xp || 0) + (data.a1.xp || 0); },
    replace(obj) { data = Object.assign(blank(), obj); save(); data = load(); }
  };
})();

// Claude API with the learner's own key (Tantôt pattern). The key never leaves this browser
// except in the request to api.anthropic.com.
window.AI = {
  key() { return Store.get("tf-api-key", ""); },
  model() { return Store.get("tf-model", "") || "claude-sonnet-5-5"; },
  async send(messages, system) {
    const key = AI.key();
    if (!key) throw new Error("Add your Anthropic API key in Settings to use the tutor.");
    if (!navigator.onLine) throw new Error("The tutor needs an internet connection.");
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: AI.model(), max_tokens: 1000, system, messages: messages.map(m => ({ role: m.role, content: m.content })) })
      });
    } catch (e) { throw new Error("Couldn't reach the Claude API. Check your connection."); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data.error && data.error.message) || res.statusText;
      if (res.status === 401) throw new Error("The API key was rejected. Check it in Settings.");
      if (res.status === 404) throw new Error("Model not found (" + AI.model() + "). Change the model in Settings.");
      throw new Error("Claude API error: " + msg);
    }
    return (data.content || []).map(b => b.text || "").join("\n") || "(empty reply)";
  }
};

// Category and level labels from v4.
window.CATS = { "project-management": "PM", governance: "Governance", procurement: "Procurement", stakeholder: "Stakeholder", pm: "PM", general: "General" };
window.TRACKS = {
  nl: { label: "PM Dutch", lang: "nl", name: "Dutch" },
  fr: { label: "Français", lang: "fr", name: "French" },
  a1: { label: "A1 Dutch", lang: "nl", name: "Dutch" }
};
