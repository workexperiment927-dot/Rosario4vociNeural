# ✝ Rosario Guidato a 4 Voci

**Applicazione Web e Android autonoma per la recita del Santo Rosario, della Coroncina alla Divina Misericordia e delle Preghiere Tradizionali a 4 voci neurali italiane alternate.**

---

## 🌐 Link Pubblici Attivi (Web App + APK Android + Cloud Storage)

| Risorsa | Descrizione | Link Diretto |
| :--- | :--- | :--- |
| **🌍 Web App (Vercel)** | Applicazione online pronta all'uso da smartphone, tablet e PC | **[https://rosario-guidato-web.vercel.app](https://rosario-guidato-web.vercel.app)** |
| **📲 APK Android (Cloud · 25 KB)** | App Android nativa leggera con streaming audio da Supabase CDN | **[Scarica Rosario-Guidato-4-Voci.apk](https://prolgfrevlxzdvmgvkxw.supabase.co/storage/v1/object/public/rosario-4-voci/Rosario-Guidato-4-Voci.apk)** |
| **📦 APK Android (100% Offline · 6.8 MB)** | App Android completa con tutti i **65 file MP3 incorporati** (funziona senza internet) | **[Scarica Rosario-Guidato-4-Voci-Offline.apk](https://prolgfrevlxzdvmgvkxw.supabase.co/storage/v1/object/public/rosario-4-voci/Rosario-Guidato-4-Voci-Offline.apk)** |
| **☁️ Supabase Storage CDN** | Bucket pubblico `rosario-4-voci` con i 65 MP3 e lo schema JSON | **[Schema JSON su Supabase](https://prolgfrevlxzdvmgvkxw.supabase.co/storage/v1/object/public/rosario-4-voci/schema-preghiere-istruzioni.json)** |

---

## 🎙️ Architettura delle 4 Voci Selezionate

Le voci sono state selezionate tra voci neurali italiane dolci, profonde, raccolte e senza cadenza artificiale:

| Nome | Ruolo | Opzione Scelta | ID Voce | Suffisso File MP3 |
| :--- | :--- | :--- | :--- | :--- |
| **Marco** | Voce Maschile 1 | **Opzione 1** | `voice-10` | `*-marco.mp3` |
| **Matteo** | Voce Maschile 2 | **Opzione 4** | `voice-14` | `*-matteo.mp3` |
| **Chiara** | Voce Femminile 1 | **Opzione 1** | `voice-16` | `*-chiara.mp3` |
| **Sofia** | Voce Femminile 2 | **Opzione 4** | `voice-02` | `*-sofia.mp3` |

### Logica di Alternanza nelle Decine (4 Schemi)
Premendo il pulsante **▶ Play** accanto a uno dei 4 nomi nell'interfaccia:
1. **Marco (`schema1`)**: Marco recita tutte le preghiere guida e nelle decine di *Santo Rosario* e *Coroncina* si alterna uno sì e uno no con le due voci femminili (**Chiara** e **Sofia**).
2. **Matteo (`schema2`)**: Matteo recita tutte le preghiere guida e nelle decine si alterna uno sì e uno no con **Chiara** e **Sofia**.
3. **Chiara (`schema3`)**: Chiara recita tutte le preghiere guida e nelle decine si alterna uno sì e uno no con le due voci maschili (**Marco** e **Matteo**).
4. **Sofia (`schema4`)**: Sofia recita tutte le preghiere guida e nelle decine si alterna uno sì e uno no con **Marco** e **Matteo**.

---

## ✨ Caratteristiche Principali

- **Interfaccia Minimale e Curata**: suddivisione chiara tra **Voci Maschili** (*Marco*, *Matteo*) e **Voci Femminili** (*Chiara*, *Sofia*) con pulsante **▶ Play / ⏸ Pausa** dedicato e indicatore visivo dei 10 grani della decina.
- **3 Temi di Lettura**: **Chiaro**, **Seppia** (predefinito per non affaticare la vista) e **Scuro**, salvati automaticamente in `localStorage`.
- **Selettore Completo delle Preghiere**:
  - **Corone Complete (a voci alternate)**: *Santo Rosario Completo (5 Decine)* con selezione automatica dei Misteri del giorno (*Gaudiosi, Luminosi, Dolorosi, Gloriosi*), *Singola Decina del Rosario*, *Coroncina alla Divina Misericordia*.
  - **Preghiere del Santo Rosario**: *Segno della Croce e Invocazione*, *Credo Apostolico*, *Padre Nostro*, *Ave Maria (Completa)*, *Gloria al Padre*, *Preghiera di Fatima (Gesù mio)*, *Salve Regina*, *Orazione Finale del Rosario*.
  - **Preghiere della Coroncina**: *Preghiera Iniziale (Ore 15)*, *Eterno Padre*, *Per la Sua dolorosa Passione (Completa)*, *Santo Dio (Trisagio)*, *Orazione Conclusiva della Coroncina*.
  - **Altre Preghiere Tradizionali**: *L'Eterno Riposo (Requiem)*, *Angelo di Dio*, *Angelus*, *Sotto la tua protezione*, *Preghiera a San Michele Arcangelo*, *Atto di Dolore*.
- **Autonomia e Portabilità**:
  - Salvataggio stato nel browser tramite `localStorage`.
  - Importazione ed esportazione dello schema e della scaletta in formato **JSON** e **CSV**.
  - Nessun account richiesto per l'utente finale.

---

## 🤖 Compilazione APK Android tramite Agent di GitHub (GitHub Actions)

Il repository include già tutto il codice sorgente Android nativo (`android-src/`) e il workflow automatico `.github/workflows/build-android-apk.yml`.

### Come usare il progetto su GitHub:
1. Crea un nuovo repository pubblico su GitHub (es. `rosario-guidato-4-voci`).
2. Carica il contenuto di questo progetto o esegui dal terminale:
   ```bash
   git remote add origin https://github.com/<TUO-USERNAME>/rosario-guidato-4-voci.git
   git branch -M main
   git push -u origin main
   ```
3. Non appena effettuato il push (oppure aprendo la scheda **Actions → Compila APK Android - Rosario a 4 Voci → Run workflow**), l'Agent di GitHub:
   - Configura **Java JDK 17** e **Android SDK 34**;
   - Esegue `./build_apk.sh` compilando `MainActivity.java` in Dalvik bytecode (`classes.dex`), impacchettando `AndroidManifest.xml` e `assets/index.html`, allineando con `zipalign` e firmando l'APK con `apksigner` (schemi v1 + v2 + v3);
   - Pubblica automaticamente il file **`Rosario-Guidato-4-Voci.apk`** sia negli **Artifacts** del workflow sia nella sezione **Releases** del repository GitHub;
   - Se colleghi questo stesso repository al tuo progetto **Vercel** (`rosario-guidato-web`), ogni modifica a `web/index.html` aggiornerà automaticamente anche il sito pubblico!

### Compilazione manuale in locale (Linux/macOS):
```bash
chmod +x build_apk.sh
./build_apk.sh
```

---

## 📁 Struttura del Repository

```text
Rosario4vociNeural/
├── .github/
│   └── workflows/
│       └── build-android-apk.yml          # Agent GitHub Actions per generare e firmare gli APK Android
├── android-src/
│   ├── AndroidManifest.xml                # Configurazione pacchetto Android (it.rosarioguidato.quattrovoci)
│   ├── release-key.jks                    # Keystore di firma APK
│   ├── res/
│   │   ├── drawable/ic_launcher.png       # Icona app (Croce su sfondo seppia/oro)
│   │   └── values/strings.xml             # Nome app "Rosario a 4 Voci"
│   └── src/it/rosarioguidato/quattrovoci/
│       └── MainActivity.java              # Activity WebView nativa con KEEP_SCREEN_ON e audio continuo
├── audio/                                 # Tutti i 65 file MP3 neurali delle 4 voci (Marco, Matteo, Chiara, Sofia)
├── docs/
│   ├── schema-4-voci-marco-matteo-chiara-sofia.md
│   └── schema-preghiere-rosario-coroncina.md
├── web/
│   ├── index.html                         # Web App collegata a Supabase Storage CDN (per Vercel e APK Cloud)
│   ├── rosario-coroncina-app.html         # Web App 100% autonoma offline (con tutti i 65 MP3 incorporati)
│   └── schema-preghiere-istruzioni.json
├── build_apk.sh                           # Script automatico di build e firma APK (SDK 34)
├── build_app.py                           # Script Python per rigenerare web/rosario-coroncina-app.html dai 65 MP3
├── package.json                           # Script di build per deploy Vercel
├── Rosario-Guidato-4-Voci.apk             # APK Android Cloud già compilato e firmato
├── Rosario-Guidato-4-Voci-Offline.apk     # APK Android 100% Offline (65 MP3 incorporati) già compilato e firmato
├── LICENSE
└── README.md                              # Documentazione completa in italiano
```

---

<div align="center">
  <p>✦ ✝ ✦</p>
  <p><em>Per la Gloria di Dio, Padre, Figlio e Spirito Santo e in onore della Madre di Dio la Vergine Immacolata</em></p>
</div>
