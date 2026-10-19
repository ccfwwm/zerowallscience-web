import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require('C:/Users/ccf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = resolve(import.meta.dirname, '..'), source = join(root, 'design/generated'), output = join(root, 'public/assets/v2');
await mkdir(output, { recursive: true });
// Preserve the supplied icon byte for byte. Resizing is only for browser icon derivatives.
const brand = await readFile(join(root, 'design/branding/zerowall-icon.png'));
const brandSha256 = createHash('sha256').update(brand).digest('hex');
await writeFile(join(output, 'zerowall-icon.png'), brand);
await sharp(brand).resize(32, 32).png().toFile(join(output, 'favicon-zerowall-32.png'));
await sharp(brand).resize(180, 180).png().toFile(join(output, 'apple-touch-zerowall.png'));
for (const oldBrand of ['brand.svg', 'favicon-32.png', 'apple-touch-icon.png']) await rm(join(output, oldBrand), { force: true });
// Only the hero removes the pale app-icon tile. Protect the white Z while retaining
// the original colour pixels. Navigation and favicons above always use the untouched PNG.
const glyphMask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><path fill="white" d="M169 165H282L305 185 309 208 191 355H273L255 396H148L70 417 123 354 247 207H153L147 203Z"/></svg>`)).ensureAlpha().raw().toBuffer();
const { data: heroPixels, info } = await sharp(brand).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < heroPixels.length; i += 4) {
  const saturation = Math.max(heroPixels[i], heroPixels[i + 1], heroPixels[i + 2]) - Math.min(heroPixels[i], heroPixels[i + 1], heroPixels[i + 2]);
  const colourAlpha = Math.max(0, Math.min(1, (saturation - 5) / 60));
  const alpha = Math.max(colourAlpha, glyphMask[i + 3] / 255);
  // Unmatte antialiased edges from the pale tile to avoid white halos on navy.
  if (alpha > 0 && alpha < 1) for (let c = 0; c < 3; c++) heroPixels[i + c] = Math.max(0, Math.min(255, (heroPixels[i + c] - 255 * (1 - alpha)) / alpha));
  heroPixels[i + 3] = Math.round(heroPixels[i + 3] * alpha);
}
const heroBrand = await sharp(heroPixels, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
await writeFile(join(output, 'hero-zerowall.png'), heroBrand);

const poster = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640"><defs><radialGradient id="cyan"><stop stop-color="#00caff" stop-opacity=".16"/><stop offset="1" stop-color="#00caff" stop-opacity="0"/></radialGradient><radialGradient id="violet"><stop stop-color="#8754ff" stop-opacity=".18"/><stop offset="1" stop-color="#8754ff" stop-opacity="0"/></radialGradient><filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="-10" dy="12" stdDeviation="22" flood-color="#1350a9" flood-opacity=".28"/></filter></defs><ellipse cx="504" cy="290" rx="254" ry="250" fill="url(#cyan)"/><ellipse cx="704" cy="353" rx="245" ry="250" fill="url(#violet)"/><g fill="none"><ellipse cx="600" cy="320" rx="274" ry="112" stroke="#30c1e9" stroke-opacity=".22" transform="rotate(-21 600 320)"/><ellipse cx="600" cy="320" rx="222" ry="175" stroke="#9569fa" stroke-opacity=".16" transform="rotate(24 600 320)"/></g><image href="data:image/png;base64,${heroBrand.toString('base64')}" x="370" y="80" width="460" height="460" filter="url(#shadow)"/><g fill="#5fd8f6" opacity=".65"><circle cx="343" cy="334" r="2"/><circle cx="433" cy="132" r="1.5"/><circle cx="382" cy="429" r="1.5"/></g><g fill="#9c7fff" opacity=".7"><path d="m850 238 13-7-4 17Z"/><path d="m869 349 9 4-4 9Z"/><path d="m818 462 9-1-3 9Z"/><circle cx="894" cy="294" r="1.5"/><circle cx="774" cy="123" r="1.5"/></g></svg>`;
await writeFile(join(output, 'hero-poster.svg'), poster);
await sharp(Buffer.from(poster)).webp({ quality: 90 }).toFile(join(output, 'hero-poster.webp'));
await sharp(Buffer.from(poster)).resize(750, 440, { fit: 'cover' }).webp({ quality: 88 }).toFile(join(output, 'hero-mobile.webp'));
const receipts = JSON.parse(await readFile(join(source, 'receipts.json'), 'utf8'));
const manifest = [];
for (const receipt of receipts) {
  if (receipt.state !== 'generated') throw new Error(`Required generated art is missing: ${receipt.name}`);
  await sharp(join(source, `${receipt.name}.png`)).resize(1536, 1024, { fit: 'cover' }).webp({ quality: 88 }).toFile(join(output, `${receipt.name}.webp`));
  manifest.push({ ...receipt, sourceSha256: receipt.sha256, path: `/assets/v2/${receipt.name}.webp`, purpose: `${receipt.name} conceptual illustration`, language: 'neutral', source: 'gpt-image-generator skill', disclosure: 'AI illustration, not a scientific result' });
}
for (const name of ['app-workspace', 'imaging']) {
  await sharp(join(source, `${name}.png`)).resize(1440, 900, { fit: 'cover' }).webp({ quality: 92 }).toFile(join(output, `${name}.webp`));
  manifest.push({ path: `/assets/v2/${name}.webp`, purpose: name === 'imaging' ? 'ImageJ file selection interface, no scientific data loaded' : 'Actual research workbench interface', language: 'zh', source: 'ZeroWall Science 8.4.0 shipped Host and offline plugins, isolated empty profile', receipt: 'design/generated/capture-receipt.json' });
}
for (const lang of ['zh', 'en']) {
  const title = lang === 'zh' ? '你的下一步研究，从这里开始。' : 'Your next step in research.';
  const subtitle = lang === 'zh' ? '科研 Agent / 虚拟敲除 / 医疗科研 / 文献复现 / 可编辑 PPTX' : 'Research Agent / Virtual knockout / Medical research / Paper reproduction / Editable PPTX';
  const art = (await sharp(join(output, 'hero-poster.webp')).png().toBuffer()).toString('base64');
  const share = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#090d14"/><image href="data:image/webp;base64,${art}" x="520" y="30" width="700" height="550"/><text x="70" y="120" fill="#00d4ff" font-family="Segoe UI,Microsoft YaHei" font-size="20">ZeroWall Science</text><text x="70" y="290" fill="#e7f0f5" font-family="Segoe UI,Microsoft YaHei" font-size="${lang === 'zh' ? 40 : 44}" font-weight="600">${title}</text><text x="70" y="365" fill="#8a9dab" font-family="Segoe UI,Microsoft YaHei" font-size="16">${subtitle}</text><line x1="70" y1="510" x2="1130" y2="510" stroke="#21303e"/><text x="70" y="555" fill="#6b8192" font-family="Segoe UI" font-size="15">zerowallscience.org</text></svg>`;
  await sharp(Buffer.from(share.replace('data:image/webp;base64,', 'data:image/png;base64,'))).png().toFile(join(output, `share-${lang}.png`));
  manifest.push({ path: `/assets/v2/share-${lang}.png`, purpose: 'Social sharing cover', language: lang, source: 'Original brand composition' });
}
for (const name of ['zerowall-icon.png', 'favicon-zerowall-32.png', 'apple-touch-zerowall.png', 'hero-zerowall.png', 'hero-poster.svg', 'hero-poster.webp', 'hero-mobile.webp']) manifest.push({ path: `/assets/v2/${name}`, source: 'User supplied original ZeroWall icon, design/branding/zerowall-icon.png', sourceSha256: brandSha256, transformation: name === 'zerowall-icon.png' ? 'None: original bytes preserved' : name.includes('hero') ? 'Original colour pixels and white Z retained; pale tile removed for hero only, cyan and violet orbital composition' : 'Size derivative only', language: 'neutral', purpose: name.includes('hero') ? 'Original icon artwork with orbital accents; static animation fallback' : 'Original ZeroWall brand icon' });
// Keep the supplied WeChat card unchanged for saving and enlargement. The square
// website view only crops surrounding text, preserving every QR pixel and its quiet zone.
const communitySource = 'design/community/wechat-group-2-original.png';
const communityImage = await readFile(join(root, communitySource));
const communitySha256 = createHash('sha256').update(communityImage).digest('hex');
await writeFile(join(output, 'wechat-group-2.png'), communityImage);
await sharp(communityImage).extract({ left: 70, top: 300, width: 400, height: 400 }).png().toFile(join(output, 'wechat-group-2-code.png'));
for (const cropped of [false, true]) manifest.push({
  path: `/assets/v2/wechat-group-2${cropped ? '-code' : ''}.png`,
  purpose: cropped ? 'Scannable WeChat group 2 QR code' : 'Original WeChat group 2 invitation card for enlargement and saving',
  source: `User supplied WeChat invitation, ${communitySource}`,
  sourceSha256: communitySha256,
  transformation: cropped ? 'Lossless crop x=70, y=300, width=400, height=400; no QR regeneration or pixel edits' : 'None: original bytes preserved',
  validBefore: '2026-10-26', language: 'zh',
});
for (const item of manifest) {
  const file = join(root, 'public', item.path), bytes = await readFile(file);
  const meta = await sharp(bytes).metadata();
  Object.assign(item, { width: meta.width, height: meta.height, bytes: (await stat(file)).size, sha256: createHash('sha256').update(bytes).digest('hex'), alt: item.purpose });
}
await writeFile(join(root, 'design/manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifest }, null, 2));
console.log(`Prepared ${manifest.length} new website assets, with provenance and hashes.`);
