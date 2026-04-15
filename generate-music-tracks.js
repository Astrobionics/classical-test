const fs = require("fs");
const path = require("path");

const AUDIO_ROOT = path.join(__dirname, "audio");
const OUTPUT_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "music-tracks.js");

const BANKS = ["easy", "medium", "hard"];
const ALLOWED_EXTENSIONS = new Set([".mp3", ".ogg", ".wav", ".m4a"]);

function normalizeForWeb(filePath) {
  return filePath.split(path.sep).join("/");
}

function getFiles(bankName) {
  const bankDir = path.join(AUDIO_ROOT, bankName);
  if (!fs.existsSync(bankDir)) return [];

  return fs.readdirSync(bankDir, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(fileName => ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "ru"))
    .map(fileName => normalizeForWeb(path.join("audio", bankName, fileName)));
}

const result = {};
for (const bank of BANKS) {
  result[bank] = getFiles(bank);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(
  OUTPUT_FILE,
  `window.MUSIC_TRACK_BANKS = ${JSON.stringify(result, null, 2)};\n`,
  "utf8"
);

console.log("Готово:", OUTPUT_FILE);