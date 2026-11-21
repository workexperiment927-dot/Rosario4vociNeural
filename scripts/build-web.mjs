import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const webDir = path.join(root, 'web');
const audioDir = path.join(root, 'audio');
const distDir = path.join(root, 'dist');
const distAudioDir = path.join(distDir, 'audio');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distAudioDir, { recursive: true });

const webFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'schema-preghiere-istruzioni.json'
];

for (const file of webFiles) {
  const src = path.join(webDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
  }
}

const iconPng = path.join(root, 'android-src', 'res', 'drawable', 'ic_launcher.png');
if (fs.existsSync(iconPng)) {
  fs.copyFileSync(iconPng, path.join(distDir, 'icon-192.png'));
}

let mp3Count = 0;
if (fs.existsSync(audioDir)) {
  for (const fname of fs.readdirSync(audioDir)) {
    if (fname.endsWith('.mp3')) {
      fs.copyFileSync(path.join(audioDir, fname), path.join(distAudioDir, fname));
      mp3Count++;
    }
  }
}

console.log(`Web app costruita in dist/ (${webFiles.length} file web + ${mp3Count} MP3 neurali).`);
