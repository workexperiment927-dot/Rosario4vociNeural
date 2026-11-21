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

  const DEFAULT_SCHEMA_DATA = {"progetto": "Santo Rosario, Coroncina alla Divina Misericordia e Preghiere Tradizionali", "versione": "2.0.0", "dataAggiornamento": "2026-11-20", "impostazioniTemporizzazione": {"pausaTraPrimaESecondaParteMs": 600, "pausaTraGraniDecinaMs": 1200, "pausaDopoMisteroMs": 1800, "pausaDopoGloriaMs": 1000, "velocitaRiproduzione": 1.0}, "vociSelezionate": {"marco": {"id": "marco", "nome": "Marco", "ruolo": "Maschile 1", "genere": "masculine", "opzioneScelta": "Opzione 1", "voiceId": "voice-10", "provinoRiferimento": "marco-opzione-1.mp3", "suffissoFile": "marco"}, "matteo": {"id": "matteo", "nome": "Matteo", "ruolo": "Maschile 2", "genere": "masculine", "opzioneScelta": "Opzione 4", "voiceId": "voice-14", "provinoRiferimento": "matteo-opzione-4.mp3", "suffissoFile": "matteo"}, "chiara": {"id": "chiara", "nome": "Chiara", "ruolo": "Femminile 1", "genere": "feminine", "opzioneScelta": "Opzione 1", "voiceId": "voice-16", "provinoRiferimento": "chiara-opzione-1.mp3", "suffissoFile": "chiara"}, "sofia": {"id": "sofia", "nome": "Sofia", "ruolo": "Femminile 2", "genere": "feminine", "opzioneScelta": "Opzione 4", "voiceId": "voice-02", "provinoRiferimento": "sofia-opzione-4.mp3", "suffissoFile": "sofia"}}, "schemiSelezione": {"schema1": {"id": "schema1", "etichettaSelettore": "Marco (Maschile 1 - Opzione 1)", "voceGuida": "marco", "vociAlternanzaDecine": ["chiara", "sofia"], "descrizione": "Marco fa da Voce Guida a tutte le preghiere; nelle decine di Rosario e Coroncina si alterna uno sì e uno no con Chiara e Sofia.", "sequenzaDecina10Grani": [{"grano": 1, "inizio": "marco", "risposta": "chiara"}, {"grano": 2, "inizio": "chiara", "risposta": "marco"}, {"grano": 3, "inizio": "marco", "risposta": "sofia"}, {"grano": 4, "inizio": "sofia", "risposta": "marco"}, {"grano": 5, "inizio": "marco", "risposta": "chiara"}, {"grano": 6, "inizio": "chiara", "risposta": "marco"}, {"grano": 7, "inizio": "marco", "risposta": "sofia"}, {"grano": 8, "inizio": "sofia", "risposta": "marco"}, {"grano": 9, "inizio": "marco", "risposta": "chiara"}, {"grano": 10, "inizio": "chiara", "risposta": "marco"}]}, "schema2": {"id": "schema2", "etichettaSelettore": "Matteo (Maschile 2 - Opzione 4)", "voceGuida": "matteo", "vociAlternanzaDecine": ["chiara", "sofia"], "descrizione": "Matteo fa da Voce Guida a tutte le preghiere; nelle decine di Rosario e Coroncina si alterna uno sì e uno no con Chiara e Sofia.", "sequenzaDecina10Grani": [{"grano": 1, "inizio": "matteo", "risposta": "chiara"}, {"grano": 2, "inizio": "chiara", "risposta": "matteo"}, {"grano": 3, "inizio": "matteo", "risposta": "sofia"}, {"grano": 4, "inizio": "sofia", "risposta": "matteo"}, {"grano": 5, "inizio": "matteo", "risposta": "chiara"}, {"grano": 6, "inizio": "chiara", "risposta": "matteo"}, {"grano": 7, "inizio": "matteo", "risposta": "sofia"}, {"grano": 8, "inizio": "sofia", "risposta": "matteo"}, {"grano": 9, "inizio": "matteo", "risposta": "chiara"}, {"grano": 10, "inizio": "chiara", "risposta": "matteo"}]}, "schema3": {"id": "schema3", "etichettaSelettore": "Chiara (Femminile 1 - Opzione 1)", "voceGuida": "chiara", "vociAlternanzaDecine": ["marco", "matteo"], "descrizione": "Chiara fa da Voce Guida a tutte le preghiere; nelle decine di Rosario e Coroncina si alterna uno sì e uno no con Marco e Matteo.", "sequenzaDecina10Grani": [{"grano": 1, "inizio": "chiara", "risposta": "marco"}, {"grano": 2, "inizio": "marco", "risposta": "chiara"}, {"grano": 3, "inizio": "chiara", "risposta": "matteo"}, {"grano": 4, "inizio": "matteo", "risposta": "chiara"}, {"grano": 5, "inizio": "chiara", "risposta": "marco"}, {"grano": 6, "inizio": "marco", "risposta": "chiara"}, {"grano": 7, "inizio": "chiara", "risposta": "matteo"}, {"grano": 8, "inizio": "matteo", "risposta": "chiara"}, {"grano": 9, "inizio": "chiara", "risposta": "marco"}, {"grano": 10, "inizio": "marco", "risposta": "chiara"}]}, "schema4": {"id": "schema4", "etichettaSelettore": "Sofia (Femminile 2 - Opzione 4)", "voceGuida": "sofia", "vociAlternanzaDecine": ["marco", "matteo"], "descrizione": "Sofia fa da Voce Guida a tutte le preghiere; nelle decine di Rosario e Coroncina si alterna uno sì e uno no con Marco e Matteo.", "sequenzaDecina10Grani": [{"grano": 1, "inizio": "sofia", "risposta": "marco"}, {"grano": 2, "inizio": "marco", "risposta": "sofia"}, {"grano": 3, "inizio": "sofia", "risposta": "matteo"}, {"grano": 4, "inizio": "matteo", "risposta": "sofia"}, {"grano": 5, "inizio": "sofia", "risposta": "marco"}, {"grano": 6, "inizio": "marco", "risposta": "sofia"}, {"grano": 7, "inizio": "sofia", "risposta": "matteo"}, {"grano": 8, "inizio": "matteo", "risposta": "sofia"}, {"grano": 9, "inizio": "sofia", "risposta": "marco"}, {"grano": 10, "inizio": "marco", "risposta": "sofia"}]}}, "preghiereAlternanzaDecine": {"ave-maria": {"titolo": "Ave Maria (1ª Parte)", "templateFile": "ave-maria-{voce}.mp3", "testo": "Ave o Maria, piena di grazia, il Signore è con te. Tu sei benedetta fra le donne e benedetto è il frutto del tuo seno, Gesù."}, "santa-maria": {"titolo": "Santa Maria (2ª Parte)", "templateFile": "santa-maria-{voce}.mp3", "testo": "Santa Maria, Madre di Dio, prega per noi peccatori, adesso e nell'ora della nostra morte. Amen."}, "passione": {"titolo": "Dolorosa Passione (1ª Parte Coroncina)", "templateFile": "passione-{voce}.mp3", "testo": "Per la Sua dolorosa Passione,"}, "misericordia": {"titolo": "Abbi Misericordia (2ª Parte Coroncina)", "templateFile": "misericordia-{voce}.mp3", "testo": "abbi misericordia di noi e del mondo intero."}}, "preghiereGuida": {"segno-della-croce": {"categoria": "rosario", "titolo": "Segno della Croce e Invocazione", "templateFile": "segno-della-croce-{voce}.mp3", "testo": "Nel nome del Padre e del Figlio e dello Spirito Santo. Amen. O Dio vieni a salvarmi. Signore vieni presto in mio aiuto."}, "credo": {"categoria": "rosario", "titolo": "Credo Apostolico", "templateFile": "credo-{voce}.mp3", "testo": "Io credo in Dio, Padre onnipotente, creatore del cielo e della terra; e in Gesù Cristo, suo unico Figlio, nostro Signore, il quale fu concepito di Spirito Santo, nacque da Maria Vergine, patì sotto Ponzio Pilato, fu crocifisso, morì e fu sepolto; discese agli inferi; il terzo giorno risuscitò da morte; salì al cielo, siede alla destra di Dio Padre onnipotente; di là verrà a giudicare i vivi e i morti. Credo nello Spirito Santo, la santa Chiesa cattolica, la comunione dei santi, la remissione dei peccati, la risurrezione della carne, la vita eterna. Amen."}, "padre-nostro": {"categoria": "rosario", "titolo": "Padre Nostro", "templateFile": "padre-nostro-{voce}.mp3", "testo": "Padre nostro che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà come in cielo così in terra. Dacci oggi il nostro pane quotidiano, e rimetti a noi i nostri debiti come anche noi li rimettiamo ai nostri debitori, e non abbandonarci alla tentazione, ma liberaci dal male. Amen."}, "gloria": {"categoria": "rosario", "titolo": "Gloria al Padre", "templateFile": "gloria-{voce}.mp3", "testo": "Gloria al Padre e al Figlio e allo Spirito Santo, come era nel principio, e ora e sempre nei secoli dei secoli. Amen."}, "preghiera-di-fatima": {"categoria": "rosario", "titolo": "Preghiera di Fatima (Gesù mio)", "templateFile": "preghiera-di-fatima-{voce}.mp3", "testo": "Gesù mio, perdona le nostre colpe, preservaci dal fuoco dell'inferno, porta in cielo tutte le anime, specialmente le più bisognose della tua misericordia."}, "salve-regina": {"categoria": "rosario", "titolo": "Salve Regina", "templateFile": "salve-regina-{voce}.mp3", "testo": "Salve o Regina, Madre di misericordia, vita, dolcezza e speranza nostra, salve. A te ricorriamo, esuli figli di Eva; a te sospiriamo, gementi e piangenti in questa valle di lacrime. Orsù dunque, avvocata nostra, rivolgi a noi gli occhi tuoi misericordiosi. E mostraci, dopo questo esilio, Gesù, il frutto benedetto del tuo seno. O clemente, o pia, o dolce Vergine Maria."}, "orazione-finale": {"categoria": "rosario", "titolo": "Orazione Finale del Rosario", "templateFile": "orazione-finale-{voce}.mp3", "testo": "Prega per noi, Santa Madre di Dio. Affinché siamo fatti degni delle promesse di Cristo. Preghiamo. O Dio, il cui unico Figlio, con la sua vita, morte e risurrezione, ci ha procurato i beni della salvezza eterna, concedi a noi, che veneriamo questi misteri nel santo Rosario della Beata Vergine Maria, di imitare ciò che contengono e di raggiungere ciò che promettono. Per Cristo nostro Signore. Amen."}, "coroncina-inizio": {"categoria": "coroncina", "titolo": "Preghiera Iniziale della Coroncina", "templateFile": "coroncina-inizio-{voce}.mp3", "testo": "Tu sei spirato, Gesù, ma la sorgente della vita è scaturita per le anime e l'oceano della misericordia si è spalancato per il mondo intero. O Fonte della Vita, insondabile Misericordia Divina, avvolgi il mondo intero e riversati fino all'ultima goccia su di noi. O Sangue e Acqua, che scaturisti dal Cuore di Gesù come sorgente di misericordia per noi, confido in Te."}, "eterno-padre": {"categoria": "coroncina", "titolo": "Eterno Padre (Grani Grandi Coroncina)", "templateFile": "eterno-padre-{voce}.mp3", "testo": "Eterno Padre, io Ti offro il Corpo e il Sangue, l'Anima e la Divinità del Tuo dilettissimo Figlio e Signore nostro Gesù Cristo, in espiazione dei nostri peccati e di quelli del mondo intero."}, "santo-dio": {"categoria": "coroncina", "titolo": "Santo Dio (Trisagio Coroncina)", "templateFile": "santo-dio-{voce}.mp3", "testo": "Santo Dio, Santo Forte, Santo Immortale, abbi pietà di noi e del mondo intero."}, "orazione-coroncina": {"categoria": "coroncina", "titolo": "Orazione Conclusiva della Coroncina", "templateFile": "orazione-coroncina-{voce}.mp3", "testo": "O Dio Eterno, in cui la misericordia è senza fine e il tesoro della compassione è inesauribile, rivolgi a noi uno sguardo benevolo e aumenta in noi la Tua misericordia, affinché nei momenti difficili non ci perdiamo d'animo né ci scoraggiamo, ma con grande fiducia ci sottomettiamo alla Tua santa volontà, che è l'Amore e la Misericordia stessa. Amen. Gesù, confido in Te."}, "eterno-riposo": {"categoria": "altre", "titolo": "L'Eterno Riposo", "templateFile": "eterno-riposo-{voce}.mp3", "testo": "L'eterno riposo dona loro, o Signore, e splenda ad essi la luce perpetua. Riposino in pace. Amen."}, "angelo-di-dio": {"categoria": "altre", "titolo": "Angelo di Dio", "templateFile": "angelo-di-dio-{voce}.mp3", "testo": "Angelo di Dio, che sei il mio custode, illumina, custodisci, reggi e governa me, che ti fui affidato dalla pietà celeste. Amen."}, "angelus": {"categoria": "altre", "titolo": "Angelus", "templateFile": "angelus-{voce}.mp3", "testo": "L'Angelo del Signore portò l'annuncio a Maria. Ed ella concepì per opera dello Spirito Santo. Eccomi, sono la serva del Signore. Si compia in me secondo la tua parola. E il Verbo si fece carne. E venne ad abitare in mezzo a noi. Prega per noi, Santa Madre di Dio. Affinché siamo fatti degni delle promesse di Cristo. Preghiamo. Infondi nel nostro spirito la tua grazia, o Padre; tu che nell'annuncio dell'angelo ci hai rivelato l'incarnazione del tuo Figlio, per la sua passione e la sua croce guidaci alla gloria della risurrezione. Per Cristo nostro Signore. Amen."}, "sotto-la-tua-protezione": {"categoria": "altre", "titolo": "Sotto la tua protezione", "templateFile": "sotto-la-tua-protezione-{voce}.mp3", "testo": "Sotto la tua protezione cerchiamo rifugio, Santa Madre di Dio: non disprezzare le suppliche di noi che siamo nella prova, ma liberaci da ogni pericolo, o Vergine gloriosa e benedetta. Amen."}, "san-michele": {"categoria": "altre", "titolo": "Preghiera a San Michele Arcangelo", "templateFile": "san-michele-{voce}.mp3", "testo": "San Michele Arcangelo, difendici nella lotta; sii nostro aiuto contro la malvagità e le insidie del demonio. Supplichevoli preghiamo che Dio lo domini e tu, Principe della milizia celeste, con il potere che ti viene da Dio, incatena nell'inferno satana e gli altri spiriti maligni che si aggirano per il mondo per perdere le anime. Amen."}, "atto-di-dolore": {"categoria": "altre", "titolo": "Atto di Dolore", "templateFile": "atto-di-dolore-{voce}.mp3", "testo": "Mio Dio, mi pento e mi dolgo con tutto il cuore dei miei peccati, perché peccando ho meritato i tuoi castighi e molto più perché ho offeso te, infinitamente buono e degno di essere amato sopra ogni cosa. Propongo con il tuo santo aiuto di non offenderti mai più e di fuggire le occasioni prossime di peccato. Signore, misericordia, perdonami."}}, "misteriRosario": {"gaudiosi": {"titolo": "Misteri Gaudiosi", "giorni": ["Lunedì", "Sabato"], "elenco": ["Primo Mistero Gaudioso: L'annunciazione dell'Angelo a Maria Vergine.", "Secondo Mistero Gaudioso: La visita di Maria Santissima a Santa Elisabetta.", "Terzo Mistero Gaudioso: La nascita di Gesù nella grotta di Betlemme.", "Quarto Mistero Gaudioso: La presentazione di Gesù al Tempio di Gerusalemme.", "Quinto Mistero Gaudioso: Il ritrovamento di Gesù dodicenne tra i dottori nel Tempio."]}, "luminosi": {"titolo": "Misteri Luminosi", "giorni": ["Giovedì"], "elenco": ["Primo Mistero Luminoso: Il Battesimo di Gesù nel fiume Giordano.", "Secondo Mistero Luminoso: Le nozze di Cana e il primo miracolo di Gesù.", "Terzo Mistero Luminoso: L'annuncio del Regno di Dio e l'invito alla conversione.", "Quarto Mistero Luminoso: La Trasfigurazione di Gesù sul monte Tabor.", "Quinto Mistero Luminoso: L'istituzione dell'Eucaristia nell'Ultima Cena."]}, "dolorosi": {"titolo": "Misteri Dolorosi", "giorni": ["Martedì", "Venerdì"], "elenco": ["Primo Mistero Doloroso: L'agonia di Gesù nell'orto del Getsemani.", "Secondo Mistero Doloroso: La flagellazione di Gesù alla colonna.", "Terzo Mistero Doloroso: L'incoronazione di spine.", "Quarto Mistero Doloroso: La salita di Gesù al Calvario carico della croce.", "Quinto Mistero Doloroso: La crocifissione e morte di Gesù sulla croce."]}, "gloriosi": {"titolo": "Misteri Gloriosi", "giorni": ["Mercoledì", "Domenica"], "elenco": ["Primo Mistero Glorioso: La risurrezione di nostro Signore Gesù Cristo.", "Secondo Mistero Glorioso: L'ascensione di Gesù al cielo.", "Terzo Mistero Glorioso: La discesa dello Spirito Santo nel Cenacolo su Maria e gli Apostoli.", "Quarto Mistero Glorioso: L'assunzione di Maria Vergine al cielo in anima e corpo.", "Quinto Mistero Glorioso: L'incoronazione di Maria Santissima Regina del cielo e della terra."]}}, "stepGenerazioneAudioTemporizzati": [{"step": 0, "descrizione": "Alternanza Rosario (Ave Maria + Santa Maria per Marco, Matteo, Chiara, Sofia)", "stato": "completato", "files": ["ave-maria-marco.mp3", "santa-maria-marco.mp3", "ave-maria-matteo.mp3", "santa-maria-matteo.mp3", "ave-maria-chiara.mp3", "santa-maria-chiara.mp3", "ave-maria-sofia.mp3", "santa-maria-sofia.mp3"]}, {"step": 1, "descrizione": "Alternanza Coroncina (Passione + Misericordia per tutte e 4 le voci) + Preghiere Guida Rosario & Coroncina di Marco", "stato": "completato", "files": ["passione-marco.mp3", "misericordia-marco.mp3", "passione-matteo.mp3", "misericordia-matteo.mp3", "passione-chiara.mp3", "misericordia-chiara.mp3", "passione-sofia.mp3", "misericordia-sofia.mp3", "segno-della-croce-marco.mp3", "credo-marco.mp3", "padre-nostro-marco.mp3", "gloria-marco.mp3", "preghiera-di-fatima-marco.mp3", "salve-regina-marco.mp3", "orazione-finale-marco.mp3", "coroncina-inizio-marco.mp3", "eterno-padre-marco.mp3"]}, {"step": 2, "descrizione": "Completamento Coroncina/Altre Preghiere di Marco + Preghiere Guida Rosario di Matteo", "stato": "completato", "files": ["santo-dio-marco.mp3", "orazione-coroncina-marco.mp3", "eterno-riposo-marco.mp3", "segno-della-croce-matteo.mp3", "credo-matteo.mp3", "padre-nostro-matteo.mp3", "gloria-matteo.mp3", "preghiera-di-fatima-matteo.mp3", "salve-regina-matteo.mp3", "orazione-finale-matteo.mp3"]}, {"step": 3, "descrizione": "Preghiere Coroncina di Matteo + Preghiere Guida Rosario di Chiara", "stato": "completato", "files": ["coroncina-inizio-matteo.mp3", "eterno-padre-matteo.mp3", "santo-dio-matteo.mp3", "orazione-coroncina-matteo.mp3", "segno-della-croce-chiara.mp3", "credo-chiara.mp3", "padre-nostro-chiara.mp3", "gloria-chiara.mp3", "preghiera-di-fatima-chiara.mp3", "salve-regina-chiara.mp3"]}, {"step": 4, "descrizione": "Completamento Chiara + Preghiere Guida Rosario e Coroncina di Sofia", "stato": "completato", "files": ["orazione-finale-chiara.mp3", "coroncina-inizio-chiara.mp3", "eterno-padre-chiara.mp3", "santo-dio-chiara.mp3", "orazione-coroncina-chiara.mp3", "segno-della-croce-sofia.mp3", "credo-sofia.mp3", "padre-nostro-sofia.mp3", "gloria-sofia.mp3", "preghiera-di-fatima-sofia.mp3"]}, {"step": 5, "descrizione": "Completamento Sofia + Altre Preghiere", "stato": "completato", "files": ["salve-regina-sofia.mp3", "orazione-finale-sofia.mp3", "coroncina-inizio-sofia.mp3", "eterno-padre-sofia.mp3", "santo-dio-sofia.mp3", "orazione-coroncina-sofia.mp3", "eterno-riposo-matteo.mp3", "eterno-riposo-chiara.mp3", "eterno-riposo-sofia.mp3"]}], "dedicaPieDiPagina": "Per la Gloria di Dio, Padre, Figlio e Spirito Santo e in onore della Madre di Dio la Vergine Immacolata"};
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
    } catch (_) {
      SCHEMA_DATA = structuredClone(DEFAULT_SCHEMA_DATA);
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
