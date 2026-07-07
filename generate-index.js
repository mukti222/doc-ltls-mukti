/**
 * generate-index.js
 *
 * Build script untuk Netlify.
 * Scan folder untuk semua file *.html (kecuali index.html),
 * baca tag <title> tiap file, lalu generate index.html
 * dengan daftar kartu navigasi.
 */

const fs = require("fs");
const path = require("path");

const EXCLUDE = ["index.html"];
const SCRIPT_NAME = path.basename(__filename);

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '""')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function extractTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(/<title>([^<]*)<\/title>/i);
    if (match && match[1].trim()) {
      // Decode HTML entities dulu agar &amp; menjadi &
      return decodeHtmlEntities(match[1].trim());
    }
  } catch {
    // fallback below
  }
  // Fallback: gunakan nama file tanpa ekstensi
  return path.basename(filePath, ".html");
}

function sanitizeTitle(title) {
  return title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateIndex() {
  const dir = process.cwd();
  const files = fs.readdirSync(dir);

  const htmlFiles = files
    .filter(
      (f) =>
        f.endsWith(".html") &&
        !EXCLUDE.includes(f) &&
        f !== SCRIPT_NAME &&
        !f.startsWith("_"),
    )
    .sort();

  const cards = htmlFiles.map((file) => {
    const filePath = path.join(dir, file);
    const title = extractTitle(filePath);
    return { file, title };
  });

  const cardsHtml = cards
    .map(
      (c) => `
          <a href="${c.file}" class="card">
            <div class="card-icon">📄</div>
            <div class="card-body">
              <h3 class="card-title">${sanitizeTitle(c.title)}</h3>
              <p class="card-file">${c.file}</p>
            </div>
            <div class="card-arrow">→</div>
          </a>`,
    )
    .join("");

  const count = cards.length;

  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dokumentasi Teknis</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #f5f7fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
      line-height: 1.7;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 48px 56px;
    }
    @media (max-width: 768px) {
      body { padding: 20px 12px; }
      .container { padding: 28px 20px; }
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 6px;
    }
    .header h1 span { margin-right: 8px; }
    .header p {
      font-size: 15px;
      color: #6b7280;
    }
    .header .count {
      display: inline-block;
      margin-top: 10px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 14px;
      border-radius: 999px;
    }

    /* Cards */
    .grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 22px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .card:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      box-shadow: 0 2px 8px rgba(37,99,235,0.1);
    }
    .card:active {
      transform: scale(0.99);
    }
    .card-icon {
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      background: #e0e7ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .card-body {
      flex: 1;
      min-width: 0;
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 2px;
    }
    .card-file {
      font-size: 13px;
      color: #9ca3af;
    }
    .card-arrow {
      flex-shrink: 0;
      font-size: 20px;
      color: #9ca3af;
      transition: transform 0.2s ease;
    }
    .card:hover .card-arrow {
      transform: translateX(4px);
      color: #2563eb;
    }

    /* Empty state */
    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #9ca3af;
    }
    .empty h2 { font-size: 20px; color: #6b7280; margin-bottom: 8px; border: none; }
    .empty p  { font-size: 14px; }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span>📚</span>Dokumentasi Teknis</h1>
      <p>Pilih topik dokumentasi di bawah untuk memulai</p>
      <div class="count">${count} dokumen</div>
    </div>

    ${
      cards.length > 0
        ? `<div class="grid">${cardsHtml}</div>`
        : `<div class="empty">
             <h2>Belum ada dokumentasi</h2>
             <p>Tambahkan file HTML ke folder ini, lalu jalankan ulang script generate-index.js</p>
           </div>`
    }

    <div class="footer">
      Dokumentasi Teknis &mdash; Generated by generate-index.js
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
  console.log(`✓ index.html generated — ${count} document(s) found`);
}

generateIndex();
