(() => {
  'use strict';

  const SUPABASE_AUDIO_BASE =
    'https://prolgfrevlxzdvmgvkxw.supabase.co/storage/v1/object/public/rosario-4-voci/';

  // Elenco dei 65 MP3 neurali effettivamente disponibili in /audio/ e su Supabase CDN
  const NEURAL_FILES = new Set([
    'angelo-di-dio-marco.mp3',
    ...['marco', 'matteo', 'chiara', 'sofia'].flatMap((v) => [
      `ave-maria-${v}.mp3`,
      `santa-maria-${v}.mp3`,
      `passione-${v}.mp3`,
      `misericordia-${v}.mp3`,
      `segno-della-croce-${v}.mp3`,
      `credo-${v}.mp3`,
      `padre-nostro-${v}.mp3`,
      `gloria-${v}.mp3`,
      `preghiera-di-fatima-${v}.mp3`,
      `salve-regina-${v}.mp3`,
      `orazione-finale-${v}.mp3`,
      `coroncina-inizio-${v}.mp3`,
      `eterno-padre-${v}.mp3`,
      `santo-dio-${v}.mp3`,
      `orazione-coroncina-${v}.mp3`,
      `eterno-riposo-${v}.mp3`
    ])
  ]);

  const PACE_PRESETS = {
    raccolto: { partMs: 950, stepMs: 1850 },
    normale: { partMs: 600, stepMs: 1200 },
    fluido: { partMs: 320, stepMs: 700 }
  };

  let SCHEMA_DATA = null;
  const LOCAL_BLOBS = {};
  const preloadAudio = new Audio();
  preloadAudio.preload = 'auto';

  const state = {
    mode: 'rosario_completo',
    singlePrayer: 'single:segno-della-croce',
    misteri: getTodayMysteryKey(),
    activeSchema: 'schema1',
    isPlaying: false,
    sequence: [],
    idx: 0,
    part: 1,
    speakingVoice: null,
    timer: null,
    speed: 1,
    pace: 'normale',
    fontScale: 1,
    keepAwake: true,
    wakeLock: null,
    deferredInstallPrompt: null,
    audioFallbackAttempted: false,
    preferSupabaseAudio: false
  };

  // DOM refs
  const $ = (id) => document.getElementById(id);
  const player = $('audioPlayer');

  function safeSet(k, v) {
    try { localStorage.setItem(k, String(v)); } catch (_) {}
  }

  function safeGet(k) {
    try { return localStorage.getItem(k); } catch (_) { return null; }
  }

  function showToast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('visible'), 2400);
  }

  function getTodayMysteryKey() {
    const day = new Date().getDay();
    if (day === 1 || day === 6) return 'gaudiosi';
    if (day === 4) return 'luminosi';
    if (day === 2 || day === 5) return 'dolorosi';
    return 'gloriosi';
  }

  function getTodayMysteryLabel(key) {
    const map = {
      gaudiosi: 'Gaudiosi · Oggi',
      luminosi: 'Luminosi · Oggi',
      dolorosi: 'Dolorosi · Oggi',
      gloriosi: 'Gloriosi · Oggi'
    };
    return map[key] || 'Oggi';
  }

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function getEffectiveMode() {
    return state.mode === 'altre' ? state.singlePrayer : state.mode;
  }

  // THEME & PREFERENCES
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.themeBtn === theme);
    });
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#10141c' : theme === 'light' ? '#1d4e89' : '#7c4d19';
    }
    safeSet('rosario_theme', theme);
  }

  function setSpeed(val) {
    state.speed = Number(val) || 1;
    player.playbackRate = state.speed;
    document.querySelectorAll('#speedChips .chip').forEach((c) => {
      c.classList.toggle('active', Number(c.dataset.speed) === state.speed);
    });
    safeSet('rosario_speed', state.speed);
  }

  function setPace(pace) {
    state.pace = PACE_PRESETS[pace] ? pace : 'normale';
    document.querySelectorAll('#paceChips .chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.pace === state.pace);
    });
    safeSet('rosario_pace', state.pace);
  }

  function setFontScale(scale) {
    state.fontScale = Number(scale) || 1;
    document.documentElement.style.setProperty('--prayer-scale', String(state.fontScale));
    document.querySelectorAll('#fontChips .chip').forEach((c) => {
      c.classList.toggle('active', Number(c.dataset.font) === state.fontScale);
    });
    safeSet('rosario_font', state.fontScale);
  }

  async function syncWakeLock() {
    if (!('wakeLock' in navigator)) return;
    if (state.isPlaying && state.keepAwake) {
      try {
        if (!state.wakeLock) {
          state.wakeLock = await navigator.wakeLock.request('screen');
          state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
        }
      } catch (_) {}
    } else if (state.wakeLock) {
      try { await state.wakeLock.release(); } catch (_) {}
      state.wakeLock = null;
    }
  }

  // AUDIO SOURCE RESOLUTION
  function hasNeuralAudio(fname) {
    return Boolean(LOCAL_BLOBS[fname] || NEURAL_FILES.has(fname));
  }

  function getPrimaryAudioUrl(fname) {
    if (LOCAL_BLOBS[fname]) return LOCAL_BLOBS[fname];
    if (window.location.protocol === 'file:' || state.preferSupabaseAudio) {
      return SUPABASE_AUDIO_BASE + encodeURIComponent(fname);
    }
    return `./audio/${encodeURIComponent(fname)}`;
  }

  function getFallbackAudioUrl(fname) {
    return SUPABASE_AUDIO_BASE + encodeURIComponent(fname);
  }

  function preloadNextAudio() {
    const cur = state.sequence[state.idx];
    if (!cur) return;
    let nextFile = null;
    if (state.part === 1 && cur.p2) {
      nextFile = cur.p2.file;
    } else if (state.idx + 1 < state.sequence.length) {
      nextFile = state.sequence[state.idx + 1].p1.file;
    }
    if (nextFile && hasNeuralAudio(nextFile)) {
      preloadAudio.src = getPrimaryAudioUrl(nextFile);
    }
  }

  // SEQUENCE BUILDER
  function buildSequence(schemaId, preserveIndex = false) {
    if (!SCHEMA_DATA) return;
    const sc = SCHEMA_DATA.schemiSelezione[schemaId];
    if (!sc) return;

    const vGuida = sc.voceGuida;
    const vOpposta = sc.vociAlternanzaDecine[0];
    const mode = getEffectiveMode();
    const seq = [];

    const addGuida = (pKey, titleOverride, extra = {}) => {
      const p = SCHEMA_DATA.preghiereGuida[pKey];
      if (!p) return;
      seq.push({
        title: titleOverride || p.titolo,
        decade: extra.decade ?? null,
        bead: extra.bead ?? null,
        meditation: extra.meditation || null,
        p1: { voice: vGuida, text: p.testo, file: `${pKey}-${vGuida}.mp3` },
        p2: null
      });
    };

    if (mode === 'rosario_completo' || mode === 'rosario_decina') {
      const mObj = SCHEMA_DATA.misteriRosario[state.misteri];
      const mList = mObj.elenco;
      const numDecine = mode === 'rosario_completo' ? 5 : 1;

      addGuida('segno-della-croce', 'Segno della Croce');
      addGuida('credo', 'Credo Apostolico');

      for (let d = 0; d < numDecine; d++) {
        const decNum = d + 1;
        const med = mList[d];

        addGuida('padre-nostro', `${decNum}° Mistero · Padre Nostro`, {
          decade: decNum,
          bead: 0,
          meditation: med
        });

        sc.sequenzaDecina10Grani.forEach((g) => {
          seq.push({
            title: `${decNum}° Mistero · Ave Maria (${g.grano}/10)`,
            decade: decNum,
            bead: g.grano,
            meditation: med,
            p1: {
              voice: g.inizio,
              text: SCHEMA_DATA.preghiereAlternanzaDecine['ave-maria'].testo,
              file: `ave-maria-${g.inizio}.mp3`
            },
            p2: {
              voice: g.risposta,
              text: SCHEMA_DATA.preghiereAlternanzaDecine['santa-maria'].testo,
              file: `santa-maria-${g.risposta}.mp3`
            }
          });
        });

        addGuida('gloria', `Gloria al Padre (${decNum}° Mistero)`, { decade: decNum, meditation: med });
        addGuida('preghiera-di-fatima', `Preghiera di Fatima (${decNum}° Mistero)`, { decade: decNum, meditation: med });
      }

      addGuida('salve-regina', 'Salve Regina');
      addGuida('orazione-finale', 'Orazione Finale del Rosario');
    } else if (mode === 'coroncina') {
      addGuida('segno-della-croce', 'Segno della Croce');
      addGuida('coroncina-inizio', 'Preghiera Iniziale della Coroncina');
      addGuida('padre-nostro', 'Padre Nostro');
      seq.push({
        title: 'Ave Maria',
        decade: null,
        bead: null,
        meditation: null,
        p1: {
          voice: vGuida,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['ave-maria'].testo,
          file: `ave-maria-${vGuida}.mp3`
        },
        p2: {
          voice: vGuida,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['santa-maria'].testo,
          file: `santa-maria-${vGuida}.mp3`
        }
      });
      addGuida('credo', 'Credo Apostolico');

      for (let d = 0; d < 5; d++) {
        const decNum = d + 1;
        addGuida('eterno-padre', `${decNum}ª Decina · Eterno Padre`, {
          decade: decNum,
          bead: 0
        });
        sc.sequenzaDecina10Grani.forEach((g) => {
          seq.push({
            title: `${decNum}ª Decina · Dolorosa Passione (${g.grano}/10)`,
            decade: decNum,
            bead: g.grano,
            meditation: null,
            p1: {
              voice: g.inizio,
              text: SCHEMA_DATA.preghiereAlternanzaDecine['passione'].testo,
              file: `passione-${g.inizio}.mp3`
            },
            p2: {
              voice: g.risposta,
              text: SCHEMA_DATA.preghiereAlternanzaDecine['misericordia'].testo,
              file: `misericordia-${g.risposta}.mp3`
            }
          });
        });
      }

      for (let t = 1; t <= 3; t++) {
        addGuida('santo-dio', `Santo Dio (${t}/3)`);
      }
      addGuida('orazione-coroncina', 'Orazione Conclusiva della Coroncina');
    } else if (mode.startsWith('single:')) {
      const pKey = mode.split(':')[1];
      addGuida(pKey);
    } else if (mode === 'pair:ave-maria') {
      seq.push({
        title: 'Ave Maria (a 2 voci)',
        decade: null,
        bead: null,
        meditation: null,
        p1: {
          voice: vGuida,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['ave-maria'].testo,
          file: `ave-maria-${vGuida}.mp3`
        },
        p2: {
          voice: vOpposta,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['santa-maria'].testo,
          file: `santa-maria-${vOpposta}.mp3`
        }
      });
    } else if (mode === 'pair:passione') {
      seq.push({
        title: 'Per la Sua dolorosa Passione (a 2 voci)',
        decade: null,
        bead: null,
        meditation: null,
        p1: {
          voice: vGuida,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['passione'].testo,
          file: `passione-${vGuida}.mp3`
        },
        p2: {
          voice: vOpposta,
          text: SCHEMA_DATA.preghiereAlternanzaDecine['misericordia'].testo,
          file: `misericordia-${vOpposta}.mp3`
        }
      });
    }

    state.sequence = seq;
    if (!preserveIndex || state.idx >= seq.length) {
      state.idx = 0;
      state.part = 1;
    }

    renderMysteriesPills();
    renderScheduleList();
    renderStage();
  }

  // UI RENDERERS
  function renderMysteriesPills() {
    const box = $('mysteriesPills');
    const mode = state.mode;
    if (mode !== 'rosario_completo') {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const curItem = state.sequence[state.idx];
    const curDecade = curItem ? curItem.decade : null;
    const mList = SCHEMA_DATA.misteriRosario[state.misteri].elenco;

    box.innerHTML = '';
    for (let d = 1; d <= 5; d++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mystery-pill';
      if (curDecade === d) btn.classList.add('active');
      else if (curDecade && d < curDecade) btn.classList.add('done');
      btn.textContent = `${d}° Mistero`;
      btn.title = mList[d - 1];
      btn.addEventListener('click', () => jumpToDecade(d));
      box.appendChild(btn);
    }
  }

  function renderBeads(item) {
    const wrap = $('crownWrap');
    const track = $('beadsTrack');
    if (!item || item.bead === null || item.bead === undefined) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    track.innerHTML = '';

    // Grano grande (Padre Nostro / Eterno Padre) + 10 grani piccoli
    for (let b = 0; b <= 10; b++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `bead-btn${b === 0 ? ' pater' : ''}`;
      if (b === item.bead) btn.classList.add('active');
      else if (b < item.bead) btn.classList.add('done');
      btn.textContent = b === 0 ? '✝' : String(b);
      btn.title = b === 0 ? 'Grano grande della decina' : `Grano ${b} di 10`;
      btn.addEventListener('click', () => jumpToBead(item.decade, b));
      track.appendChild(btn);
    }
  }

  function renderStage() {
    const item = state.sequence[state.idx];
    const total = state.sequence.length;

    if (!item) {
      $('statusTitle').textContent = "Pronto all'ascolto";
      $('statusStepMeta').textContent = 'Scegli una voce guida o premi Play';
      $('speakerPill').hidden = true;
      $('crownWrap').hidden = true;
      $('meditationBanner').hidden = true;
      $('overallProgressText').textContent = '0 / 0';
      return;
    }

    const activePart = state.part === 2 && item.p2 ? item.p2 : item.p1;
    const vName = SCHEMA_DATA.vociSelezionate[activePart.voice].nome;
    const isNeural = hasNeuralAudio(activePart.file);

    $('statusTitle').textContent = item.title;
    $('statusStepMeta').textContent =
      `Guida: ${SCHEMA_DATA.vociSelezionate[SCHEMA_DATA.schemiSelezione[state.activeSchema].voceGuida].nome} · Passo ${state.idx + 1} di ${total}`;

    const spPill = $('speakerPill');
    spPill.hidden = false;
    spPill.textContent = `Voce: ${vName}`;

    const typePill = $('audioTypePill');
    typePill.textContent = isNeural ? 'Audio Neurale HD' : 'Sintesi Vocale';

    const medEl = $('meditationBanner');
    if (item.meditation) {
      medEl.hidden = false;
      medEl.textContent = item.meditation;
    } else {
      medEl.hidden = true;
    }

    renderBeads(item);
    renderMysteriesPills();

    // Render prayer parts (Part 1 + optional Part 2)
    const partsEl = $('prayerParts');
    partsEl.innerHTML = '';

    const parts = item.p2 ? [item.p1, item.p2] : [item.p1];
    parts.forEach((p, i) => {
      const partNum = i + 1;
      const div = document.createElement('div');
      div.className = 'prayer-part';
      if (state.isPlaying) {
        if (state.part === partNum) div.classList.add('speaking');
        else div.classList.add('dimmed');
      } else if (partNum === state.part) {
        div.classList.add('speaking');
      }

      const tag = document.createElement('div');
      tag.className = 'part-speaker-tag';
      const pVoiceName = SCHEMA_DATA.vociSelezionate[p.voice].nome;
      tag.textContent = item.p2
        ? `${partNum === 1 ? '1ª Parte' : 'Risposta'} · ${pVoiceName}`
        : pVoiceName;

      const txt = document.createElement('div');
      txt.className = 'part-text';
      txt.textContent = p.text;

      div.appendChild(tag);
      div.appendChild(txt);
      partsEl.appendChild(div);
    });

    $('overallProgressText').textContent = `${state.idx + 1} / ${total}`;
    updateVoiceCardsUI();
    highlightScheduleItem();
  }

  function updateVoiceCardsUI() {
    const mainBtn = $('btnMainPlay');
    if (state.isPlaying) {
      mainBtn.textContent = '⏸ Pausa';
    } else if (state.idx > 0 || state.part > 1) {
      mainBtn.textContent = '▶ Riprendi';
    } else {
      mainBtn.textContent = '▶ Inizia';
    }

    ['schema1', 'schema2', 'schema3', 'schema4'].forEach((id) => {
      const card = $(`card-${id}`);
      const btn = $(`btn-${id}`);
      const isSelected = state.activeSchema === id;
      const isSpeakingThisVoice =
        state.isPlaying && state.speakingVoice && card.dataset.voiceId === state.speakingVoice;

      card.classList.toggle('selected-schema', isSelected);
      card.classList.toggle('speaking-now', Boolean(isSpeakingThisVoice));

      if (isSelected && state.isPlaying) {
        btn.textContent = '⏸ Pausa';
      } else if (isSelected && (state.idx > 0 || state.part > 1)) {
        btn.textContent = '▶ Riprendi';
      } else {
        btn.textContent = '▶ Play';
      }
    });
  }

  function renderScheduleList() {
    const list = $('scheduleList');
    list.innerHTML = '';
    state.sequence.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'schedule-item';
      btn.dataset.idx = String(i);
      const v1 = SCHEMA_DATA.vociSelezionate[s.p1.voice].nome;
      const v2 = s.p2 ? ` → ${SCHEMA_DATA.vociSelezionate[s.p2.voice].nome}` : '';
      btn.innerHTML = `<span>${i + 1}. ${s.title}</span><span class="schedule-voices">${v1}${v2}</span>`;
      btn.addEventListener('click', () => {
        state.idx = i;
        state.part = 1;
        if (state.isPlaying) playCurrent();
        else renderStage();
      });
      list.appendChild(btn);
    });
    highlightScheduleItem();
  }

  function highlightScheduleItem() {
    const items = $('scheduleList').querySelectorAll('.schedule-item');
    items.forEach((el) => {
      el.classList.toggle('current', Number(el.dataset.idx) === state.idx);
    });
  }

  // MEDIA SESSION (Lock-screen & Bluetooth controls)
  function updateMediaSession(item, voiceName) {
    if (!('mediaSession' in navigator) || !item) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: `Voce: ${voiceName}`,
        album: 'Rosario Guidato a 4 Voci',
        artwork: [{ src: './icon-192.png', sizes: '192x192', type: 'image/png' }]
      });
      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => toggleMainPlay());
      navigator.mediaSession.setActionHandler('pause', () => pausePlayback());
      navigator.mediaSession.setActionHandler('previoustrack', () => stepPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => stepNext());
      navigator.mediaSession.setActionHandler('stop', () => stopAll());
    } catch (_) {}
  }

  // PLAYBACK ENGINE
  function pausePlayback() {
    state.isPlaying = false;
    state.speakingVoice = null;
    clearTimeout(state.timer);
    player.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    syncWakeLock();
    renderStage();
  }

  function toggleMainPlay() {
    if (state.isPlaying) {
      pausePlayback();
      return;
    }
    if (!state.sequence.length) buildSequence(state.activeSchema);
    state.isPlaying = true;
    syncWakeLock();
    playCurrent();
  }

  function toggleVoiceSchema(schemaId) {
    if (state.activeSchema === schemaId && state.isPlaying) {
      pausePlayback();
      return;
    }
    if (state.activeSchema !== schemaId) {
      clearTimeout(state.timer);
      player.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      state.activeSchema = schemaId;
      safeSet('rosario_minimal_schema', schemaId);
      buildSequence(schemaId, true);
    }
    state.isPlaying = true;
    syncWakeLock();
    playCurrent();
  }

  function playCurrent() {
    if (!state.isPlaying) return;
    clearTimeout(state.timer);

    const item = state.sequence[state.idx];
    if (!item) {
      finishSequence();
      return;
    }

    const partObj = state.part === 2 && item.p2 ? item.p2 : item.p1;
    state.speakingVoice = partObj.voice;
    state.audioFallbackAttempted = false;

    const vName = SCHEMA_DATA.vociSelezionate[partObj.voice].nome;
    renderStage();
    updateMediaSession(item, vName);
    preloadNextAudio();
    saveResumeState();

    // If we know no MP3 exists for this prayer/voice, go directly to Italian SpeechSynthesis
    if (!hasNeuralAudio(partObj.file)) {
      speakFallback(partObj);
      return;
    }

    player.onended = null;
    player.onerror = null;
    player.src = getPrimaryAudioUrl(partObj.file);
    player.playbackRate = state.speed;
    player.onended = () => nextTimed();
    player.onerror = () => {
      if (
        !state.audioFallbackAttempted &&
        window.location.protocol !== 'file:' &&
        !state.preferSupabaseAudio &&
        !LOCAL_BLOBS[partObj.file]
      ) {
        state.audioFallbackAttempted = true;
        state.preferSupabaseAudio = true;
        player.src = getFallbackAudioUrl(partObj.file);
        player.playbackRate = state.speed;
        player.play().catch(() => speakFallback(partObj));
      } else {
        speakFallback(partObj);
      }
    };

    player.play().catch(() => speakFallback(partObj));
  }

  function speakFallback(partObj) {
    if (!state.isPlaying) return;
    $('audioProgressFill').style.width = '50%';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(partObj.text);
      u.lang = 'it-IT';
      u.rate = state.speed;
      u.onend = () => nextTimed();
      u.onerror = () => nextTimed();
      window.speechSynthesis.speak(u);
    } else {
      state.timer = setTimeout(() => nextTimed(), 2500);
    }
  }

  function nextTimed() {
    if (!state.isPlaying) return;
    const item = state.sequence[state.idx];
    const preset = PACE_PRESETS[state.pace] || PACE_PRESETS.normale;

    if (state.part === 1 && item && item.p2) {
      state.timer = setTimeout(() => {
        state.part = 2;
        playCurrent();
      }, preset.partMs);
    } else {
      state.timer = setTimeout(() => {
        if (state.idx + 1 < state.sequence.length) {
          state.idx++;
          state.part = 1;
          playCurrent();
        } else {
          finishSequence();
        }
      }, preset.stepMs);
    }
  }

  function finishSequence() {
    stopAll();
    showToast('Preghiera completata. Amen.');
  }

  function stopAll() {
    state.isPlaying = false;
    state.speakingVoice = null;
    clearTimeout(state.timer);
    player.pause();
    player.currentTime = 0;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.idx = 0;
    state.part = 1;
    $('audioProgressFill').style.width = '0%';
    $('audioTimeCur').textContent = '0:00';
    $('audioTimeDur').textContent = '0:00';
    safeSet('rosario_resume_idx', 0);
    syncWakeLock();
    renderStage();
  }

  function stepPrev() {
    if (!state.sequence.length) return;
    if (state.idx > 0) {
      state.idx--;
      state.part = 1;
      if (state.isPlaying) playCurrent();
      else renderStage();
    }
  }

  function stepNext() {
    if (!state.sequence.length) return;
    if (state.idx + 1 < state.sequence.length) {
      state.idx++;
      state.part = 1;
      if (state.isPlaying) playCurrent();
      else renderStage();
    }
  }

  function jumpToDecade(decNum) {
    const target = state.sequence.findIndex((s) => s.decade === decNum && s.bead === 0);
    if (target >= 0) {
      state.idx = target;
      state.part = 1;
      if (state.isPlaying) playCurrent();
      else renderStage();
    }
  }

  function jumpToBead(decNum, beadNum) {
    const target = state.sequence.findIndex((s) => s.decade === decNum && s.bead === beadNum);
    if (target >= 0) {
      state.idx = target;
      state.part = 1;
      if (state.isPlaying) playCurrent();
      else renderStage();
    }
  }

  function saveResumeState() {
    safeSet('rosario_resume_mode', state.mode);
    safeSet('rosario_resume_idx', state.idx);
  }

  // MODE SWITCHING
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('.mode-tab').forEach((t) => {
      const active = t.dataset.mode === mode;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });

    $('misteriBox').hidden = !(mode === 'rosario_completo' || mode === 'rosario_decina');
    $('singlePrayerBox').hidden = mode !== 'altre';

    const wasPlaying = state.isPlaying;
    clearTimeout(state.timer);
    player.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.isPlaying = false;
    state.speakingVoice = null;

    buildSequence(state.activeSchema, false);
    if (wasPlaying) {
      state.isPlaying = true;
      playCurrent();
    }
  }

  // IMPORT / EXPORT
  function exportJSON() {
    const blob = new Blob([JSON.stringify(SCHEMA_DATA, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'schema-preghiere-istruzioni.json';
    a.click();
    showToast('Schema JSON esportato');
  }

  function exportCSV() {
    const rows = [['Passo', 'Titolo', 'Voce1', 'File1', 'Voce2', 'File2']];
    state.sequence.forEach((s, i) => {
      rows.push([
        i + 1,
        `"${s.title.replace(/"/g, '""')}"`,
        s.p1.voice,
        s.p1.file,
        s.p2 ? s.p2.voice : '',
        s.p2 ? s.p2.file : ''
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scaletta-rosario.csv';
    a.click();
    showToast('Scaletta CSV esportata');
  }

  function importJSON(ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        Object.assign(SCHEMA_DATA, JSON.parse(e.target.result));
        buildSequence(state.activeSchema, false);
        showToast('Schema JSON importato');
      } catch (_) {
        showToast('File JSON non valido');
      }
    };
    reader.readAsText(f);
  }

  function loadMP3s(ev) {
    const files = Array.from(ev.target.files || []);
    files.forEach((f) => {
      LOCAL_BLOBS[f.name] = URL.createObjectURL(f);
    });
    if (files.length) {
      renderStage();
      showToast(`Caricati ${files.length} file MP3 locali`);
    }
  }

  // EVENT BINDING
  function bindEvents() {
    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(btn.dataset.themeBtn));
    });

    $('btnSettings').addEventListener('click', () => {
      const panel = $('settingsPanel');
      const open = panel.classList.toggle('open');
      $('btnSettings').classList.toggle('active', open);
      $('btnSettings').setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('#speedChips .chip').forEach((c) => {
      c.addEventListener('click', () => setSpeed(c.dataset.speed));
    });
    document.querySelectorAll('#paceChips .chip').forEach((c) => {
      c.addEventListener('click', () => setPace(c.dataset.pace));
    });
    document.querySelectorAll('#fontChips .chip').forEach((c) => {
      c.addEventListener('click', () => setFontScale(c.dataset.font));
    });

    $('chkWakeLock').addEventListener('change', (e) => {
      state.keepAwake = e.target.checked;
      safeSet('rosario_wakelock', state.keepAwake ? '1' : '0');
      syncWakeLock();
    });

    document.querySelectorAll('.mode-tab').forEach((tab) => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    $('selMisteri').addEventListener('change', (e) => {
      state.misteri = e.target.value;
      const todayKey = getTodayMysteryKey();
      $('todayMysteryBadge').hidden = state.misteri !== todayKey;
      const wasPlaying = state.isPlaying;
      stopAll();
      buildSequence(state.activeSchema, false);
      if (wasPlaying) {
        state.isPlaying = true;
        playCurrent();
      }
    });

    $('selSinglePrayer').addEventListener('change', (e) => {
      state.singlePrayer = e.target.value;
      const wasPlaying = state.isPlaying;
      stopAll();
      buildSequence(state.activeSchema, false);
      if (wasPlaying) {
        state.isPlaying = true;
        playCurrent();
      }
    });

    document.querySelectorAll('.voice-play-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleVoiceSchema(btn.dataset.schema));
    });

    $('btnMainPlay').addEventListener('click', toggleMainPlay);
    $('btnPrev').addEventListener('click', stepPrev);
    $('btnNext').addEventListener('click', stepNext);
    $('btnStop').addEventListener('click', stopAll);

    $('btnToggleSchedule').addEventListener('click', () => {
      const p = $('schedulePanel');
      const open = p.classList.toggle('open');
      $('btnToggleSchedule').textContent = open ? 'Nascondi scaletta' : 'Mostra scaletta';
    });
    $('btnCloseSchedule').addEventListener('click', () => {
      $('schedulePanel').classList.remove('open');
      $('btnToggleSchedule').textContent = 'Mostra scaletta';
    });

    $('btnExportJSON').addEventListener('click', exportJSON);
    $('btnExportCSV').addEventListener('click', exportCSV);
    $('inpImportJSON').addEventListener('change', importJSON);
    $('inpLoadMP3').addEventListener('change', loadMP3s);

    player.addEventListener('timeupdate', () => {
      const cur = player.currentTime || 0;
      const dur = player.duration || 0;
      $('audioTimeCur').textContent = formatTime(cur);
      $('audioTimeDur').textContent = formatTime(dur);
      $('audioProgressFill').style.width = dur > 0 ? `${Math.min(100, (cur / dur) * 100)}%` : '0%';
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncWakeLock();
    });

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleMainPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      } else if (e.code === 'Escape') {
        stopAll();
      }
    });

    // PWA install button
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredInstallPrompt = e;
      $('btnInstall').hidden = false;
    });

    $('btnInstall').addEventListener('click', async () => {
      if (!state.deferredInstallPrompt) return;
      state.deferredInstallPrompt.prompt();
      const res = await state.deferredInstallPrompt.userChoice;
      if (res.outcome === 'accepted') {
        $('btnInstall').hidden = true;
        showToast('App installata sul dispositivo');
      }
      state.deferredInstallPrompt = null;
    });
  }

  async function init() {
    setTheme(safeGet('rosario_theme') || 'sepia');
    setSpeed(safeGet('rosario_speed') || 1);
    setPace(safeGet('rosario_pace') || 'normale');
    setFontScale(safeGet('rosario_font') || 1);

    const savedWake = safeGet('rosario_wakelock');
    if (savedWake !== null) {
      state.keepAwake = savedWake === '1';
      $('chkWakeLock').checked = state.keepAwake;
    }

    const todayKey = getTodayMysteryKey();
    state.misteri = todayKey;
    $('selMisteri').value = todayKey;
    $('todayMysteryBadge').textContent = getTodayMysteryLabel(todayKey);

    try {
      const res = await fetch('./schema-preghiere-istruzioni.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      SCHEMA_DATA = await res.json();
    } catch (err) {
      $('statusTitle').textContent = 'Errore caricamento schema';
      $('statusStepMeta').textContent = 'Impossibile leggere schema-preghiere-istruzioni.json';
      return;
    }

    const savedSchema = safeGet('rosario_minimal_schema');
    if (savedSchema && SCHEMA_DATA.schemiSelezione[savedSchema]) {
      state.activeSchema = savedSchema;
    }

    bindEvents();
    buildSequence(state.activeSchema, false);

    // Register Service Worker for offline PWA caching
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();
