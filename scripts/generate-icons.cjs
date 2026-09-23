/* Genera favicon.ico, apple-icon.png y los iconos del manifest a partir de
   src/app/icon.svg. Uso, desde la raiz del repo:  node scripts/generate-icons.cjs */
const sharp = require(process.cwd() + "/node_modules/sharp");
const fs = require("fs");
const svg = fs.readFileSync("src/app/icon.svg");
const BG = "#0F1012";

/** La placa rasterizada a `size` px, desde el SVG (densidad alta y reescalado). */
const plate = (size) => sharp(svg, { density: Math.ceil((72 * size) / 64) * 4 }).resize(size, size).png().toBuffer();

/** Placa centrada sobre un cuadrado oscuro a sangre, ocupando `ratio` del lado. */
async function onBackground(size, ratio) {
  const inner = Math.round(size * ratio);
  const off = Math.round((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: await plate(inner), left: off, top: off }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO con las imágenes embebidas como PNG (válido desde Windows Vista y en todos los navegadores). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8); dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

(async () => {
  const icoPngs = [];
  for (const size of [16, 32, 48]) icoPngs.push({ size, data: await plate(size) });
  fs.writeFileSync("src/app/favicon.ico", ico(icoPngs));
  fs.writeFileSync("src/app/apple-icon.png", await onBackground(180, 0.72));
  fs.writeFileSync("public/icons/icon-192.png", await onBackground(192, 0.72));
  fs.writeFileSync("public/icons/icon-512.png", await onBackground(512, 0.72));
  // Maskable: Android recorta a un círculo del 80 %; la placa va al 56 % para
  // que ni el chaflán ni la pata de la R toquen el borde de la máscara.
  fs.writeFileSync("public/icons/icon-maskable-512.png", await onBackground(512, 0.56));
  for (const f of ["src/app/favicon.ico", "src/app/apple-icon.png", "public/icons/icon-192.png", "public/icons/icon-512.png", "public/icons/icon-maskable-512.png"])
    console.log(f, fs.statSync(f).size + " B");
})();
