# TaalForge v5

Static HTML/JS app, no build step. Three tracks: **PM Dutch** (18 lessons), **Français** (14 lessons) and **A1 Dutch** (Zo gezegd 1.1, parts 1–4). Works offline once installed.

## Run it locally

Open a terminal in this folder and run `python3 -m http.server 8000`, then open http://localhost:8000. (Opening `index.html` directly also works, but offline mode needs http or https.)

## Deploy (GitHub + Cloudflare Pages)

1. Create a **private** GitHub repo and upload the contents of this folder (not the folder itself).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Build settings: framework **None**, build command **empty**, output directory **/**. Deploy.
4. On each iPhone: open the `*.pages.dev` URL in Safari → Share → **Add to Home Screen**.
5. In TaalForge: Settings → check the Dutch voice says "Belgian voice found", then test the microphone.

After changing any file, bump `VERSION` in `sw.js` so phones fetch the new copy (they update on the next launch).

## Where things live

| Path | What |
| --- | --- |
| `data/nl.js`, `data/fr.js` | v4 lessons, extracted unchanged. `{name}` is filled from Settings |
| `data/scenarios.js`, `data/vocab.js` | v4 role-plays and vocabulary deck |
| `data/a1.js` | A1 units: learn notes, sentences, exercises, sound pairs, check recipe |
| `js/a1.js` | A1 views, exercise runner, model-answer templates |
| `js/app.js` | Router, PM/FR views, sentence player, chat, settings |
| `js/dutch.js` | Numbers, clock times, prices, spelling, answer checking |
| `js/speech.js` | Text-to-speech (nl-BE preferred) and speech recognition |

## Adding part 5 (and onwards)

Copy one unit object in `data/a1.js`, give it `id: "a1-05"`, `num: 5`, and fill in `learn`, `listen`, `practise`, `pronounce` and `check`. Exercise set types: `fill`, `choice`, `dictation` (`mode`: spell, number, price, time), `clock`, `form`. Write your own sentences; link the book, never copy it.

## Privacy checklist (before every push)

- No real names, addresses, employers or children's names in any file. Personal answers come from the Over mij form and stay in the phone's browser.
- Personal MP3s stay on the phone, not in the repo.
- The API key is entered in Settings on each device; it is never in the code.

## Storage keys

Kept from v4: `tf-lang`, `tf-progress`, `tf-vocab`, `tts-rate`. New: `tf-name`, `tf-api-key`, `tf-model`, `tf-a1-profile`, `tf-listen-first`, `tf-a1-listen-first`. Settings → Save backup file moves progress between devices.
