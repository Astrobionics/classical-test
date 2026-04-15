const fs = require("fs");
const path = require("path");

const IMAGE_ROOT = path.join(__dirname, "images");
const OUTPUT_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "art-items.js");

const BANKS = ["easy", "medium", "hard"];
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function normalizeForWeb(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizeAuthor(author) {
  return author.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseArtFileName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const parts = fileName.split("=");

  if (parts.length < 3) {
    throw new Error(
      `Неверный формат имени файла: "${fileName}". Ожидается формат: Автор =Картина=`
    );
  }

  const author = parts[0].trim();
  const title = parts.slice(1, -1).join("=").trim();

  if (!author || !title) {
    throw new Error(
      `Не удалось извлечь автора или название из файла: "${fileName}"`
    );
  }

  return {
    author,
    title,
    authorKey: normalizeAuthor(author),
    displayFull: `${author} "${title}"`,
  };
}

function getFiles(bankName) {
  const bankDir = path.join(IMAGE_ROOT, bankName);
  if (!fs.existsSync(bankDir)) return [];

  return fs.readdirSync(bankDir, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(fileName => ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "ru"))
    .map(fileName => {
      const relativePath = normalizeForWeb(path.join("images", bankName, fileName));
      const parsed = parseArtFileName(fileName);

      return {
        file: relativePath,
        author: parsed.author,
        title: parsed.title,
        authorKey: parsed.authorKey,
        displayFull: parsed.displayFull,
      };
    });
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
  `window.ART_ITEM_BANKS = ${JSON.stringify(result, null, 2)};\n`,
  "utf8"
);

console.log("Готово:", OUTPUT_FILE);