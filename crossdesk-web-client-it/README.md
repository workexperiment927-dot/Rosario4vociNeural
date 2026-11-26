# CrossDesk Web Client — edizione italiana

Questo è il **Web Client originale di CrossDesk** ([kunkundi/crossdesk-web-client](https://github.com/kunkundi/crossdesk-web-client), commit `34022c1` del 2026‑11‑23), con l'interfaccia tradotta **in italiano**. HTML, CSS e JavaScript reali, con connessione WebRTC: nessuna simulazione, nessuna build npm.

## Avvio in locale

```bash
cd crossdesk-web-client-it
python3 -m http.server 8080 --bind 127.0.0.1
```

Apri `http://127.0.0.1:8080` nel browser. In rete locale basta HTTP; per accedere da remoto serve HTTPS (WebRTC richiede un contesto sicuro, eccezione fatta per localhost).

## Come si usa

1. Sul dispositivo **remoto** che vuoi controllare installa e avvia CrossDesk Desktop (Windows/macOS/Linux, release ufficiale `v1.7.7-20261124`).
2. Copia dall'app l'**ID dispositivo** e la **password temporanea**.
3. Inseriscili nella pagina del web client e premi **Connetti**: otterrai video e audio in streaming, controllo di mouse, tastiera e touch, trasferimento file e clipboard condivisa.

## Server di segnalazione

Il client usa di default il servizio pubblico `wss://api.crossdesk.cn:9099` (e STUN `stun:api.crossdesk.cn:3478`). Per cambiarli modifica `CONFIG.signalingUrl` in `web_client.js` (riga 38) e `CONFIG.iceServers`; in alternativa puoi auto-ospitare il [server di segnalazione ufficiale](https://github.com/kunkundi/crossdesk-server) (release `v1.1.39`, binario `crossdesk_server-linux-amd64`).

## Test

```bash
node --test tests/
```

46 test del progetto originale, tutti verdi anche nella versione italiana (37 controllo touch, 8 segnalazione, 1 credenziali TURN).

## Differenze dall'originale

- Tutte le stringhe dell'interfaccia tradotte dal cinese all'italiano (`lang="it"`).
- Le due asserzioni dei test che confrontavano il testo cinese dei messaggi d'errore usano ora le frasi italiane.
- Tutto il resto è invariato: logica WebRTC, file transfer, service worker di download, credenziali TURN.
