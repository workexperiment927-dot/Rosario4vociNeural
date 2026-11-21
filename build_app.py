import base64
import json
import os

SCHEMA_PATH = (
    os.path.join("web", "schema-preghiere-istruzioni.json")
    if os.path.exists(os.path.join("web", "schema-preghiere-istruzioni.json"))
    else "schema-preghiere-istruzioni.json"
)
AUDIO_DIR = "audio" if os.path.isdir("audio") else "."
OUTPUT_HTML = (
    os.path.join("web", "rosario-coroncina-app.html")
    if os.path.isdir("web")
    else "rosario-coroncina-app.html"
)

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    schema_data = json.load(f)

schema_data["dedicaPieDiPagina"] = "Per la Gloria di Dio, Padre, Figlio e Spirito Santo e in onore della Madre di Dio la Vergine Immacolata"
for step in schema_data["stepGenerazioneAudioTemporizzati"]:
    step["stato"] = "completato"

with open(SCHEMA_PATH, "w", encoding="utf-8") as f:
    json.dump(schema_data, f, ensure_ascii=False, indent=2)

embedded_audio = {}
for fname in sorted(os.listdir(AUDIO_DIR)):
    if fname.endswith(".mp3") and any(
        fname.endswith(f"-{v}.mp3") for v in ("marco", "matteo", "chiara", "sofia")
    ):
        with open(os.path.join(AUDIO_DIR, fname), "rb") as af:
            b64 = base64.b64encode(af.read()).decode("ascii")
            embedded_audio[fname] = f"data:audio/mpeg;base64,{b64}"

html_template = """<!DOCTYPE html>
<html lang="it" data-theme="sepia">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rosario Guidato a 4 Voci</title>
  <style>
    :root, [data-theme="light"] {
      --bg: #f5f6f8;
      --bg-grad: linear-gradient(180deg, #eef1f5 0%, #f7f8fa 100%);
      --card: #ffffff;
      --card-hover: #f9fbfd;
      --border: #dde2ea;
      --text: #1c2430;
      --muted: #5e6b7c;
      --accent: #1e4d7b;
      --accent-fg: #ffffff;
      --active-bg: #ebf3fa;
      --active-border: #2b6cb0;
      --ornament: #94a3b8;
      --shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
    }
    [data-theme="sepia"] {
      --bg: #f4eee1;
      --bg-grad: linear-gradient(180deg, #efe6d5 0%, #f7f2e7 100%);
      --card: #fcf9f2;
      --card-hover: #f9f3e6;
      --border: #dfd3be;
      --text: #2c2216;
      --muted: #75634d;
      --accent: #7c4d19;
      --accent-fg: #fffdf9;
      --active-bg: #f5ead6;
      --active-border: #9c6626;
      --ornament: #b69b74;
      --shadow: 0 4px 16px rgba(62, 41, 14, 0.07);
    }
    [data-theme="dark"] {
      --bg: #13171f;
      --bg-grad: linear-gradient(180deg, #0f131a 0%, #171c26 100%);
      --card: #1d2330;
      --card-hover: #232a39;
      --border: #2e374a;
      --text: #edf1f7;
      --muted: #9aa6b8;
      --accent: #3b82f6;
      --accent-fg: #ffffff;
      --active-bg: #1e2d47;
      --active-border: #60a5fa;
      --ornament: #475569;
      --shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Georgia", "Times New Roman", system-ui, -apple-system, serif;
      background: var(--bg-grad);
      color: var(--text);
      display: flex;
      justify-content: center;
      padding: 24px 16px 32px;
      transition: background 0.25s, color 0.25s;
    }
    .wrap {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
    }

    /* TOP BAR & THEMES */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      gap: 10px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent);
      color: var(--accent-fg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      box-shadow: var(--shadow);
    }
    h1 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .theme-switch {
      display: inline-flex;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 3px;
      gap: 2px;
      box-shadow: var(--shadow);
      font-family: system-ui, -apple-system, sans-serif;
    }
    .theme-btn {
      border: none;
      background: transparent;
      color: var(--muted);
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .theme-btn.active {
      background: var(--accent);
      color: var(--accent-fg);
    }

    /* SELECTORS */
    .selector-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      box-shadow: var(--shadow);
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .sel-row {
      display: flex;
      gap: 8px;
    }
    .selector-card select {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .selector-card select:focus {
      border-color: var(--accent);
    }

    /* VOICE GROUPS */
    .group-title {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: var(--muted);
      margin: 10px 0 7px 4px;
      font-weight: 700;
    }
    .voice-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-bottom: 8px;
    }
    .voice-row {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 13px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: var(--shadow);
      transition: all 0.18s ease;
    }
    .voice-row:hover {
      background: var(--card-hover);
    }
    .voice-row.playing {
      border-color: var(--active-border);
      background: var(--active-bg);
      box-shadow: 0 0 0 1px var(--active-border), var(--shadow);
    }
    .voice-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .voice-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--border);
      transition: background 0.2s, transform 0.2s;
    }
    .voice-row.playing .voice-dot {
      background: var(--accent);
      transform: scale(1.25);
    }
    .voice-name {
      font-size: 1.08rem;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .play-btn {
      font-family: system-ui, -apple-system, sans-serif;
      border: none;
      background: var(--accent);
      color: var(--accent-fg);
      border-radius: 999px;
      padding: 8px 20px;
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      min-width: 102px;
      text-align: center;
      transition: transform 0.1s, opacity 0.15s;
    }
    .play-btn:hover {
      opacity: 0.92;
    }
    .play-btn:active {
      transform: scale(0.97);
    }

    /* READING & STATUS CARD */
    .status-box {
      margin-top: 14px;
      padding: 15px 16px;
      border-radius: 12px;
      background: var(--card);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .status-top {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--accent);
      font-size: 0.82rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 7px;
    }
    .nav-mini {
      display: flex;
      gap: 5px;
    }
    .nav-mini button {
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      border-radius: 6px;
      padding: 3px 9px;
      cursor: pointer;
      font-size: 0.75rem;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .nav-mini button:hover {
      border-color: var(--accent);
    }
    .status-text {
      font-size: 0.98rem;
      line-height: 1.55;
      color: var(--text);
      min-height: 44px;
    }
    .beads-mini {
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: center;
      padding-top: 4px;
    }
    .b-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border);
      transition: all 0.2s;
    }
    .b-dot.active {
      background: var(--accent);
      transform: scale(1.35);
    }

    /* FOOTER TOOLS & DEDICATION */
    .footer-tools {
      font-family: system-ui, -apple-system, sans-serif;
      margin-top: 14px;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.74rem;
      color: var(--muted);
    }
    .footer-tools a, .footer-tools label {
      color: var(--muted);
      text-decoration: none;
      border-bottom: 1px dotted var(--muted);
      cursor: pointer;
    }
    .footer-tools a:hover, .footer-tools label:hover {
      color: var(--text);
    }
    .dedica-footer {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 0.85rem;
      font-style: italic;
      color: var(--muted);
      line-height: 1.5;
      letter-spacing: 0.15px;
    }
    .dedica-ornament {
      color: var(--ornament);
      font-style: normal;
      font-size: 0.8rem;
      margin-bottom: 4px;
      letter-spacing: 4px;
    }
  </style>
</head>
<body>

<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <span class="brand-icon">✝</span>
      <h1>Rosario a 4 Voci</h1>
    </div>
    <div class="theme-switch" role="group" aria-label="Tema colore">
      <button class="theme-btn" id="th-light" onclick="setTheme('light')">Chiaro</button>
      <button class="theme-btn active" id="th-sepia" onclick="setTheme('sepia')">Seppia</button>
      <button class="theme-btn" id="th-dark" onclick="setTheme('dark')">Scuro</button>
    </div>
  </div>

  <!-- SELETTORE COMPLETO DI TUTTE LE PREGHIERE -->
  <div class="selector-card">
    <select id="selMode" onchange="onModeChange()" aria-label="Seleziona Preghiera">
      <optgroup label="Corone Complete (Voci Alternate)">
        <option value="rosario_completo">Santo Rosario Completo (5 Decine)</option>
        <option value="rosario_decina">Santo Rosario — Singola Decina</option>
        <option value="coroncina">Coroncina alla Divina Misericordia</option>
      </optgroup>
      <optgroup label="Preghiere del Santo Rosario">
        <option value="single:segno-della-croce">Segno della Croce e Invocazione</option>
        <option value="single:credo">Credo Apostolico</option>
        <option value="single:padre-nostro">Padre Nostro</option>
        <option value="pair:ave-maria">Ave Maria (Completa)</option>
        <option value="single:gloria">Gloria al Padre</option>
        <option value="single:preghiera-di-fatima">Preghiera di Fatima (Gesù mio)</option>
        <option value="single:salve-regina">Salve Regina</option>
        <option value="single:orazione-finale">Orazione Finale del Rosario</option>
      </optgroup>
      <optgroup label="Preghiere della Coroncina">
        <option value="single:coroncina-inizio">Preghiera Iniziale della Coroncina (Ore 15)</option>
        <option value="single:eterno-padre">Eterno Padre</option>
        <option value="pair:passione">Per la Sua dolorosa Passione (Completa)</option>
        <option value="single:santo-dio">Santo Dio (Trisagio)</option>
        <option value="single:orazione-coroncina">Orazione Conclusiva della Coroncina</option>
      </optgroup>
      <optgroup label="Altre Preghiere Tradizionali">
        <option value="single:eterno-riposo">L'Eterno Riposo (Requiem)</option>
        <option value="single:angelo-di-dio">Angelo di Dio</option>
        <option value="single:angelus">Angelus</option>
        <option value="single:sotto-la-tua-protezione">Sotto la tua protezione</option>
        <option value="single:san-michele">Preghiera a San Michele Arcangelo</option>
        <option value="single:atto-di-dolore">Atto di Dolore</option>
      </optgroup>
    </select>

    <div class="sel-row" id="misteriRow">
      <select id="selMisteri" onchange="onModeChange()" aria-label="Seleziona Misteri">
        <option value="gaudiosi">Misteri Gaudiosi (Lunedì e Sabato)</option>
        <option value="luminosi">Misteri Luminosi (Giovedì)</option>
        <option value="dolorosi">Misteri Dolorosi (Martedì e Venerdì)</option>
        <option value="gloriosi">Misteri Gloriosi (Mercoledì e Domenica)</option>
      </select>
    </div>
  </div>

  <!-- VOCI MASCHILI -->
  <div class="group-title">Voci Maschili</div>
  <div class="voice-list">
    <div class="voice-row" id="row-schema1">
      <div class="voice-info">
        <span class="voice-dot"></span>
        <span class="voice-name">Marco</span>
      </div>
      <button class="play-btn" id="btn-schema1" onclick="toggleVoiceSchema('schema1')">▶ Play</button>
    </div>
    <div class="voice-row" id="row-schema2">
      <div class="voice-info">
        <span class="voice-dot"></span>
        <span class="voice-name">Matteo</span>
      </div>
      <button class="play-btn" id="btn-schema2" onclick="toggleVoiceSchema('schema2')">▶ Play</button>
    </div>
  </div>

  <!-- VOCI FEMMINILI -->
  <div class="group-title">Voci Femminili</div>
  <div class="voice-list">
    <div class="voice-row" id="row-schema3">
      <div class="voice-info">
        <span class="voice-dot"></span>
        <span class="voice-name">Chiara</span>
      </div>
      <button class="play-btn" id="btn-schema3" onclick="toggleVoiceSchema('schema3')">▶ Play</button>
    </div>
    <div class="voice-row" id="row-schema4">
      <div class="voice-info">
        <span class="voice-dot"></span>
        <span class="voice-name">Sofia</span>
      </div>
      <button class="play-btn" id="btn-schema4" onclick="toggleVoiceSchema('schema4')">▶ Play</button>
    </div>
  </div>

  <!-- RIQUADRO LETTURA IN CORSO -->
  <div class="status-box">
    <div class="status-top">
      <span id="statusTitle">Pronto all'ascolto</span>
      <div class="nav-mini">
        <button onclick="stepPrev()" title="Precedente">◀</button>
        <button onclick="stopAll()" title="Ferma">■</button>
        <button onclick="stepNext()" title="Successivo">▶</button>
      </div>
    </div>
    <div class="status-text" id="statusText">Scegli la preghiera e premi Play accanto al nome desiderato.</div>
    <div class="beads-mini" id="beadsMini" style="display:none;"></div>
  </div>

  <audio id="audioPlayer" preload="auto" style="display:none;"></audio>

  <div class="footer-tools">
    <a onclick="exportJSON()">Esporta JSON</a>
    <a onclick="exportCSV()">Esporta CSV</a>
    <label>Importa JSON<input type="file" accept=".json" style="display:none" onchange="importJSON(event)" /></label>
    <label>Carica MP3<input type="file" accept="audio/*" multiple style="display:none" onchange="loadMP3s(event)" /></label>
  </div>

  <footer class="dedica-footer">
    <div class="dedica-ornament">✦ ✝ ✦</div>
    Per la Gloria di Dio, Padre, Figlio e Spirito Santo e in onore della Madre di Dio la Vergine Immacolata
  </footer>
</div>

<script>
const SCHEMA_DATA = __SCHEMA_JSON__;
const EMBEDDED_AUDIO = __EMBEDDED_AUDIO_JSON__;
const LOCAL_BLOBS = {};

let state = {
  activeSchema: null,
  isPlaying: false,
  sequence: [],
  idx: 0,
  part: 1,
  timer: null
};

function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  ["light", "sepia", "dark"].forEach(t => {
    const b = document.getElementById("th-" + t);
    if (b) b.classList.toggle("active", t === theme);
  });
  safeSet("rosario_theme", theme);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = safeGet("rosario_theme") || "sepia";
  setTheme(savedTheme);

  const day = new Date().getDay();
  const selM = document.getElementById("selMisteri");
  if (day === 1 || day === 6) selM.value = "gaudiosi";
  else if (day === 4) selM.value = "luminosi";
  else if (day === 2 || day === 5) selM.value = "dolorosi";
  else selM.value = "gloriosi";

  const saved = safeGet("rosario_minimal_schema");
  if (saved && SCHEMA_DATA.schemiSelezione[saved]) {
    state.activeSchema = saved;
  }
});

function onModeChange() {
  const mode = document.getElementById("selMode").value;
  const showMisteri = mode === "rosario_completo" || mode === "rosario_decina";
  document.getElementById("misteriRow").style.display = showMisteri ? "flex" : "none";

  if (state.activeSchema) {
    const wasPlaying = state.isPlaying;
    stopAll();
    buildSequence(state.activeSchema);
    if (wasPlaying) {
      state.isPlaying = true;
      updateButtonsUI();
      playCurrent();
    }
  }
}

function buildSequence(schemaId) {
  const sc = SCHEMA_DATA.schemiSelezione[schemaId];
  const vGuida = sc.voceGuida;
  const vOpposta = sc.vociAlternanzaDecine[0];
  const mode = document.getElementById("selMode").value;
  const seq = [];

  const addGuida = (pKey, titleOverride) => {
    const p = SCHEMA_DATA.preghiereGuida[pKey];
    if (!p) return;
    seq.push({
      title: titleOverride || p.titolo,
      bead: null,
      p1: { voice: vGuida, text: p.testo, file: `${pKey}-${vGuida}.mp3` },
      p2: null
    });
  };

  if (mode === "rosario_completo" || mode === "rosario_decina") {
    const mKey = document.getElementById("selMisteri").value;
    const mList = SCHEMA_DATA.misteriRosario[mKey].elenco;
    const numDecine = mode === "rosario_completo" ? 5 : 1;

    addGuida("segno-della-croce", "Segno della Croce");
    addGuida("credo", "Credo Apostolico");

    for (let d = 0; d < numDecine; d++) {
      seq.push({
        title: `${d + 1}° Mistero · Padre Nostro`,
        bead: 0,
        p1: {
          voice: vGuida,
          text: mList[d] + " " + SCHEMA_DATA.preghiereGuida["padre-nostro"].testo,
          file: `padre-nostro-${vGuida}.mp3`
        },
        p2: null
      });

      sc.sequenzaDecina10Grani.forEach(g => {
        seq.push({
          title: `${d + 1}° Mistero · Ave Maria (${g.grano}/10)`,
          bead: g.grano,
          p1: {
            voice: g.inizio,
            text: SCHEMA_DATA.preghiereAlternanzaDecine["ave-maria"].testo,
            file: `ave-maria-${g.inizio}.mp3`
          },
          p2: {
            voice: g.risposta,
            text: SCHEMA_DATA.preghiereAlternanzaDecine["santa-maria"].testo,
            file: `santa-maria-${g.risposta}.mp3`
          }
        });
      });

      addGuida("gloria", `Gloria al Padre (${d + 1}° Mistero)`);
      addGuida("preghiera-di-fatima", `Preghiera di Fatima (${d + 1}° Mistero)`);
    }

    addGuida("salve-regina", "Salve Regina");
    addGuida("orazione-finale", "Orazione Finale");
  } else if (mode === "coroncina") {
    addGuida("segno-della-croce", "Segno della Croce");
    addGuida("coroncina-inizio", "Preghiera Iniziale della Coroncina");
    addGuida("padre-nostro", "Padre Nostro");
    seq.push({
      title: "Ave Maria",
      bead: null,
      p1: {
        voice: vGuida,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["ave-maria"].testo,
        file: `ave-maria-${vGuida}.mp3`
      },
      p2: {
        voice: vGuida,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["santa-maria"].testo,
        file: `santa-maria-${vGuida}.mp3`
      }
    });
    addGuida("credo", "Credo Apostolico");

    for (let d = 0; d < 5; d++) {
      seq.push({
        title: `${d + 1}ª Decina · Eterno Padre`,
        bead: 0,
        p1: {
          voice: vGuida,
          text: SCHEMA_DATA.preghiereGuida["eterno-padre"].testo,
          file: `eterno-padre-${vGuida}.mp3`
        },
        p2: null
      });
      sc.sequenzaDecina10Grani.forEach(g => {
        seq.push({
          title: `${d + 1}ª Decina · Dolorosa Passione (${g.grano}/10)`,
          bead: g.grano,
          p1: {
            voice: g.inizio,
            text: SCHEMA_DATA.preghiereAlternanzaDecine["passione"].testo,
            file: `passione-${g.inizio}.mp3`
          },
          p2: {
            voice: g.risposta,
            text: SCHEMA_DATA.preghiereAlternanzaDecine["misericordia"].testo,
            file: `misericordia-${g.risposta}.mp3`
          }
        });
      });
    }

    for (let t = 1; t <= 3; t++) {
      addGuida("santo-dio", `Santo Dio (${t}/3)`);
    }
    addGuida("orazione-coroncina", "Orazione Conclusiva della Coroncina");
  } else if (mode.startsWith("single:")) {
    const pKey = mode.split(":")[1];
    addGuida(pKey);
  } else if (mode === "pair:ave-maria") {
    seq.push({
      title: "Ave Maria",
      bead: null,
      p1: {
        voice: vGuida,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["ave-maria"].testo,
        file: `ave-maria-${vGuida}.mp3`
      },
      p2: {
        voice: vOpposta,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["santa-maria"].testo,
        file: `santa-maria-${vOpposta}.mp3`
      }
    });
  } else if (mode === "pair:passione") {
    seq.push({
      title: "Per la Sua dolorosa Passione",
      bead: null,
      p1: {
        voice: vGuida,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["passione"].testo,
        file: `passione-${vGuida}.mp3`
      },
      p2: {
        voice: vOpposta,
        text: SCHEMA_DATA.preghiereAlternanzaDecine["misericordia"].testo,
        file: `misericordia-${vOpposta}.mp3`
      }
    });
  }

  state.sequence = seq;
  state.idx = 0;
  state.part = 1;
  renderBeadsDots(null);
}

function renderBeadsDots(activeBead) {
  const box = document.getElementById("beadsMini");
  if (activeBead === null || activeBead === undefined) {
    box.style.display = "none";
    return;
  }
  box.style.display = "flex";
  let html = "";
  for (let i = 1; i <= 10; i++) {
    html += `<span class="b-dot${i === activeBead ? ' active' : ''}"></span>`;
  }
  box.innerHTML = html;
}

function toggleVoiceSchema(schemaId) {
  if (state.activeSchema === schemaId && state.isPlaying) {
    state.isPlaying = false;
    clearTimeout(state.timer);
    document.getElementById("audioPlayer").pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    updateButtonsUI();
    return;
  }

  if (state.activeSchema !== schemaId || state.sequence.length === 0) {
    stopAll();
    state.activeSchema = schemaId;
    safeSet("rosario_minimal_schema", schemaId);
    buildSequence(schemaId);
  }

  state.isPlaying = true;
  updateButtonsUI();
  playCurrent();
}

function updateButtonsUI() {
  ["schema1", "schema2", "schema3", "schema4"].forEach(id => {
    const row = document.getElementById("row-" + id);
    const btn = document.getElementById("btn-" + id);
    const active = state.activeSchema === id && state.isPlaying;
    row.classList.toggle("playing", active);
    if (state.activeSchema === id && !state.isPlaying && state.sequence.length > 0 && state.idx > 0) {
      btn.textContent = "▶ Riprendi";
    } else {
      btn.textContent = active ? "⏸ Pausa" : "▶ Play";
    }
  });
}

function getSrc(fname) {
  if (LOCAL_BLOBS[fname]) return LOCAL_BLOBS[fname];
  if (EMBEDDED_AUDIO[fname]) return EMBEDDED_AUDIO[fname];
  return fname;
}

function playCurrent() {
  if (!state.isPlaying) return;
  clearTimeout(state.timer);
  const item = state.sequence[state.idx];
  if (!item) {
    stopAll();
    return;
  }

  const partObj = state.part === 2 && item.p2 ? item.p2 : item.p1;
  const vName = SCHEMA_DATA.vociSelezionate[partObj.voice].nome;
  document.getElementById("statusTitle").textContent = `${item.title} · Voce: ${vName}`;
  document.getElementById("statusText").textContent = partObj.text;
  renderBeadsDots(item.bead);

  const player = document.getElementById("audioPlayer");
  player.onended = null;
  player.onerror = null;
  player.src = getSrc(partObj.file);
  player.onended = () => nextTimed();
  player.onerror = () => speakFallback(partObj);
  player.play().catch(() => speakFallback(partObj));
}

function speakFallback(partObj) {
  if (!state.isPlaying) return;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(partObj.text);
    u.lang = "it-IT";
    u.onend = () => nextTimed();
    u.onerror = () => nextTimed();
    window.speechSynthesis.speak(u);
  } else {
    nextTimed();
  }
}

function nextTimed() {
  if (!state.isPlaying) return;
  const item = state.sequence[state.idx];
  const pausePart = SCHEMA_DATA.impostazioniTemporizzazione.pausaTraPrimaESecondaParteMs || 600;
  const pauseStep = SCHEMA_DATA.impostazioniTemporizzazione.pausaTraGraniDecinaMs || 1200;

  if (state.part === 1 && item.p2) {
    state.timer = setTimeout(() => {
      state.part = 2;
      playCurrent();
    }, pausePart);
  } else {
    state.timer = setTimeout(() => {
      if (state.idx + 1 < state.sequence.length) {
        state.idx++;
        state.part = 1;
        playCurrent();
      } else {
        stopAll();
      }
    }, pauseStep);
  }
}

function stopAll() {
  state.isPlaying = false;
  clearTimeout(state.timer);
  const player = document.getElementById("audioPlayer");
  player.pause();
  player.currentTime = 0;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  state.idx = 0;
  state.part = 1;
  document.getElementById("statusTitle").textContent = "Pronto all'ascolto";
  document.getElementById("statusText").textContent = "Scegli la preghiera e premi Play accanto al nome desiderato.";
  renderBeadsDots(null);
  updateButtonsUI();
}

function stepPrev() {
  if (!state.sequence.length) return;
  if (state.idx > 0) {
    state.idx--;
    state.part = 1;
    if (state.isPlaying) playCurrent();
    else {
      const item = state.sequence[state.idx];
      document.getElementById("statusTitle").textContent = item.title;
      document.getElementById("statusText").textContent = item.p1.text;
      renderBeadsDots(item.bead);
    }
  }
}

function stepNext() {
  if (!state.sequence.length) return;
  if (state.idx + 1 < state.sequence.length) {
    state.idx++;
    state.part = 1;
    if (state.isPlaying) playCurrent();
    else {
      const item = state.sequence[state.idx];
      document.getElementById("statusTitle").textContent = item.title;
      document.getElementById("statusText").textContent = item.p1.text;
      renderBeadsDots(item.bead);
    }
  }
}

function exportJSON() {
  const b = new Blob([JSON.stringify(SCHEMA_DATA, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "schema-preghiere-istruzioni.json";
  a.click();
}

function exportCSV() {
  const scId = state.activeSchema || "schema1";
  buildSequence(scId);
  const rows = [["Passo", "Titolo", "Voce1", "File1", "Voce2", "File2"]];
  state.sequence.forEach((s, i) => {
    rows.push([
      i + 1,
      `"${s.title}"`,
      s.p1.voice,
      s.p1.file,
      s.p2 ? s.p2.voice : "",
      s.p2 ? s.p2.file : ""
    ]);
  });
  const b = new Blob([rows.map(r => r.join(",")).join("\\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "scaletta-rosario.csv";
  a.click();
}

function importJSON(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    try { Object.assign(SCHEMA_DATA, JSON.parse(e.target.result)); } catch (err) {}
  };
  r.readAsText(f);
}

function loadMP3s(ev) {
  Array.from(ev.target.files || []).forEach(f => {
    LOCAL_BLOBS[f.name] = URL.createObjectURL(f);
  });
}
</script>
</body>
</html>
"""

html_out = html_template.replace(
    "__SCHEMA_JSON__", json.dumps(schema_data, ensure_ascii=False)
).replace(
    "__EMBEDDED_AUDIO_JSON__", json.dumps(embedded_audio, ensure_ascii=False)
)

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_out)

print(f"Built refined {OUTPUT_HTML} with {len(embedded_audio)} embedded MP3 files ({len(html_out)/1024:.1f} KB)")
