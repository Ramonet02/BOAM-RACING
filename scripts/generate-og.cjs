/* Genera src/app/opengraph-image.jpg (y twitter-image.jpg) sobre la foto propia
   de los 4 Escort. Uso, desde la raiz del repo:  node scripts/generate-og.cjs
   OJO: el texto usa "Segoe UI" y "Consolas", fuentes de Windows. En otro
   sistema, librsvg cae a una fuente por defecto: generalo en Windows o cambia
   font-family por fuentes instaladas. */
const sharp = require(process.cwd() + "/node_modules/sharp");
const fs = require("fs");
const W = 1200, H = 630;
const preview = process.argv[2]; // opcional: carpeta donde dejar thumbs/og-preview.jpg
(async () => {
  // Foto propia del equipo (los 4 Escort rotulados): sin licencias de terceros.
  const photo = await sharp("public/images/coches/formacion-completa.jpg")
    .resize(W, Math.round((1067 / 1600) * W))
    .extract({ left: 0, top: 150, width: W, height: H })
    .toBuffer();

  // Arriba se oscurece para apagar los rotulos del centro comercial; el centro
  // queda limpio para los coches; abajo, sobre el asfalto, va el texto.
  const overlay = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="v" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#0F1012" stop-opacity="0.93"/>
        <stop offset="0.22" stop-color="#0F1012" stop-opacity="0.72"/>
        <stop offset="0.36" stop-color="#0F1012" stop-opacity="0.12"/>
        <stop offset="0.62" stop-color="#0F1012" stop-opacity="0.12"/>
        <stop offset="0.76" stop-color="#0F1012" stop-opacity="0.82"/>
        <stop offset="1" stop-color="#0F1012" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
    <text x="148" y="86" font-family="Consolas" font-size="22" letter-spacing="5" fill="#FF6B00">UNIRAID · FEBRERO 2027</text>
    <text x="148" y="114" font-family="Consolas" font-size="17" letter-spacing="3" fill="#B4AFA6">4 FORD ESCORT · SIN GPS</text>
    <text x="66" y="548" font-family="Segoe UI" font-weight="700" font-size="100" letter-spacing="3" fill="#F2EFE9">BOAM RACING</text>
    <rect x="72" y="570" width="120" height="4" fill="#FF6B00"/>
    <text x="214" y="584" font-family="Segoe UI" font-size="30" fill="#D9D4CB">Rally solidario universitario por Marruecos</text>
  </svg>`;

  const icon = await sharp(fs.readFileSync("src/app/icon.svg"), { density: 288 }).resize(56, 56).png().toBuffer();

  const out = await sharp(photo)
    .composite([
      { input: Buffer.from(overlay), left: 0, top: 0 },
      { input: icon, left: 72, top: 60 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync("src/app/opengraph-image.jpg", out);
  fs.copyFileSync("src/app/opengraph-image.jpg", "src/app/twitter-image.jpg");
  const alt = "BOAM RACING · UniRaid febrero 2027 · Los cuatro Ford Escort del equipo, rotulados, en formación al atardecer";
  fs.writeFileSync("src/app/opengraph-image.alt.txt", alt);
  fs.writeFileSync("src/app/twitter-image.alt.txt", alt);
  console.log("OG", Math.round(out.length / 1024) + " KB");
  if (preview) await sharp(out).resize(700).toFile(preview + "/thumbs/og-preview.jpg");
})();
