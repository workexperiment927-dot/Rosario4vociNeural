# CrossDesk Web — clone in italiano (v1.7.7)

Web app in **un unico file HTML** (`index.html`), senza dipendenze e senza CDN:
funziona **offline**, anche aprendo il file con `file://` nel browser.

## Come scaricarla in locale

1. Scarica `index.html` (dal repository oppure dal pulsante **Download → Scarica questa web app** dentro l'app).
2. Aprila con qualsiasi browser moderno (Chrome, Firefox, Edge, Safari).
3. Nessuna installazione, nessun server: ID, password, dispositivi recenti e impostazioni sono salvati nel browser (localStorage).

Per avere tutto in uno ZIP: nella root del repository esegui

```bash
python3 -c "import zipfile; z=zipfile.ZipFile('crossdesk-web.zip','w',zipfile.ZIP_DEFLATED); z.write('crossdesk-web/index.html','index.html'); z.write('crossdesk-web/README.md','README.md'); z.close()"
```

## Cosa include (funzioni della v1.7.7-20261124)

- **Home**: ID locale persistente, password temporanea rigenerabile, codice QR simulato, connessione con ID + password, **connessione diretta IP:porta**, dispositivi recenti con alias/gruppi.
- **Sessione remota simulata**: schermo canvas con mouse virtuale, statistiche live (FPS, latenza, bitrate, risoluzione, durata), schermo intero, **schermo privacy nero**, qualità video, sensibilità puntatore/rotellina (rotellina salvata per dispositivo), appunti condivisi, scorciatoie da tastiera.
- **Trasferimento file**: selezione multipla, barra di avanzamento, annullamento (come il copia-incolla file della 1.7.7, fino a 128 file).
- **Impostazioni**: server personalizzato, qualità predefinita, solo dispositivi fidati, avvio automatico, pairing con impronta.
- **Novità v1.7.7**: changelog completo tradotto in italiano.
- **Download**: pulsante per scaricare l'HTML stesso + link ufficiali all'app originale.

## Limiti onesti

Questa è una **demo web dell'interfaccia**: un vero controllo remoto richiede cattura schermo e WebRTC, disponibili solo nel client nativo. Per controllare davvero un computer, scarica l'app originale:

- Android: https://github.com/kunkundi/crossdesk/releases/download/v1.7.7-20261124/crossdesk-android-arm64-v1.7.7-20261124.apk
- Tutte le piattaforme: https://github.com/kunkundi/crossdesk/releases/tag/v1.7.7-20261124

Progetto originale: [kunkundi/crossdesk](https://github.com/kunkundi/crossdesk) (vedi la sua LICENSE).
