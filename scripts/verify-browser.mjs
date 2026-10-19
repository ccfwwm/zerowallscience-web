import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ccf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.SITE_PREVIEW_URL || 'http://127.0.0.1:4323';
const out = resolve(import.meta.dirname, '../artifacts/verification'); await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { checkedAt: new Date().toISOString(), base, layouts: [], typography: [], downloads: [], interactions: [], errors: [] };
const ids = ['agent', 'knockout', 'medical', 'reproduce', 'presentation'];
try {
  for (const lang of (process.env.BROWSER_INTERACTIONS_ONLY ? [] : ['zh','en'])) for (const width of [1440,1280,768,390]) {
    const height = width === 390 ? 844 : width === 1280 ? 800 : 960;
    const page = await browser.newPage({ viewport: { width, height } });
    let requests = 0;
    page.on('request', request => { if (request.url().endsWith('/latest.json')) requests++; });
    page.on('pageerror', error => report.errors.push(`${lang}/${width}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(`${lang}/${width}: ${message.text()}`); });
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) report.errors.push(`${response.status()}: ${response.url()}`); });
    await page.goto(`${base}${lang === 'en' ? '/en/' : '/'}`);
    await page.locator('.hero h1').waitFor();
    await page.waitForTimeout(2100);
    await page.evaluate(() => document.fonts.ready);
    const typography = await page.evaluate(() => {
      const size = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
      return { description: size('.feature-description'), points: size('.feature-points'), title: size('.feature-copy h2'), titleWeight: Number(getComputedStyle(document.querySelector('.feature-copy h2')).fontWeight), heroBody: size('.hero-sub'), demoText: size('.agent-plan li'), fontLoaded: document.fonts.check('600 18px Montserrat'), chineseStack: getComputedStyle(document.body).fontFamily };
    });
    assert(typography.description >= 16 && typography.points >= 16 && typography.heroBody >= 16, 'Primary text must remain readable');
    assert(typography.title >= 30 && typography.titleWeight >= 700, 'Strong feature headings');
    assert(typography.demoText >= 14 && typography.fontLoaded, 'Readable demo and local brand font');
    report.typography.push({ lang, width, ...typography });
    const downloads = page.locator('[data-latest-windows-download]');
    assert.equal(await downloads.count(), 3);
    assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}/${width} horizontal overflow`);
    assert.equal(requests, 1, 'one shared metadata request per page');
    const heroFile = `${lang}-${width}-hero.png`; await page.screenshot({ path: join(out, heroFile) });
    const enhanced = await page.locator('[data-story]').evaluate(n => n.classList.contains('story-enhanced'));
    assert.equal(enhanced, width >= 1200 && height >= 780);
    for (const id of ids) {
      if (width <= 1199) await page.locator('.menu-toggle').click();
      await page.locator(`.nav-links a[href="#${id}"]`).click();
      if (enhanced) await page.waitForFunction(id => document.querySelector(`[id="${id}"]`).classList.contains('is-current'), id);
      await page.waitForTimeout(1000);
      assert.equal(new URL(page.url()).hash, `#${id}`);
      const panel = page.locator(`#${id}`); assert.equal(await panel.getAttribute('aria-hidden'), enhanced ? 'false' : null);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}/${width}/${id} overflow`);
      if (enhanced) {
        const geometry = await panel.evaluate(node => {
          const visual = node.querySelector('.feature-visual').getBoundingClientRect(), copy = node.querySelector('.feature-copy').getBoundingClientRect();
          const nav = document.querySelector('.site-header').getBoundingClientRect(), progress = document.querySelector('.story-progress').getBoundingClientRect();
          return { top: Math.min(visual.top, copy.top), bottom: Math.max(visual.bottom, copy.bottom), navBottom: nav.bottom, progressTop: progress.top, reversed: visual.x < copy.x };
        });
        assert(geometry.top > geometry.navBottom && geometry.bottom <= geometry.progressTop + 2, `${lang}/${width}/${id}: larger text and windows must fit between navigation and chapter controls: ${JSON.stringify(geometry)}`);
        assert.equal(geometry.reversed, ['knockout','reproduce'].includes(id), 'Alternating feature layout');
      }
      if (width === 1440 || width === 390) {
        if (!enhanced) await panel.locator('.feature-visual').scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(out, `${lang}-${width}-${id}.png`) });
      }
    }
    await page.goBack();
    if (enhanced) await page.waitForFunction(() => document.querySelector('#reproduce').classList.contains('is-current'));
    assert.equal(new URL(page.url()).hash, '#reproduce');
    report.layouts.push({ lang, width, height, overflow: false, sticky: enhanced, metadataRequests: requests, hero: heroFile });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto(`${base}/#medical`);
  await page.waitForFunction(() => document.querySelector('#medical').classList.contains('is-current'));
  await page.waitForTimeout(800);
  await page.locator('[data-medical-tab="1"]').click();
  assert.equal(await page.locator('[data-medical-panel="1"]').isVisible(), true);
  await page.screenshot({ path: join(out, 'medical-clinical-tab.png') });
  await page.locator('[data-medical-tab="1"]').press('ArrowRight');
  await page.locator('[data-medical-panel="2"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-medical-tab="2"]').getAttribute('aria-selected'), 'true');
  await page.screenshot({ path: join(out, 'medical-imaging-tab.png') });
  await page.locator('.nav-links a[href="#presentation"]').click();
  await page.waitForFunction(() => document.querySelector('#presentation').classList.contains('is-current'));
  await page.waitForTimeout(900);
  await page.locator('[data-ppt-mode="objects"]').click();
  await page.locator('[data-ppt-page="2"]').click();
  await page.locator('.slide-chart').press('Enter');
  assert.equal(await page.locator('.slide-chart').evaluate(n => n.classList.contains('is-selected')), true);
  await page.screenshot({ path: join(out, 'editable-object-selection.png') });
  await page.locator('.nav-links a[href="#agent"]').click();
  await page.waitForFunction(() => document.querySelector('#agent').classList.contains('is-current'));
  await page.waitForTimeout(900);
  await page.locator('.capture-link').click();
  assert.equal(await page.locator('dialog').evaluate(n => n.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.capture-link').evaluate(n => n === document.activeElement), true);
  report.interactions.push('direct hash, history back, medical keyboard tabs, PPTX object selection, dialog Escape and focus return');
  // All three real native CTAs must start downloads without changing the website URL.
  for (let index = 0; index < 3; index++) {
    const before = page.url(); const anchor = page.locator('[data-latest-windows-download]').nth(index);
    const [download] = await Promise.all([page.waitForEvent('download'), anchor.click()]);
    assert(download.suggestedFilename().endsWith('.exe'));
    assert.equal(page.url(), before); await download.cancel();
    report.downloads.push({ index, filename: download.suggestedFilename(), pageUnchanged: true });
  }
  await page.close();
  for (const mode of ['no-js','reduced-motion','no-webgl','low-performance','offline-metadata']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, javaScriptEnabled: mode !== 'no-js', reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    if (mode === 'no-webgl') await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return String(type).includes('webgl') ? null : original.call(this, type, ...args); }; });
    if (mode === 'low-performance') await page.addInitScript(() => { Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 }); });
    if (mode === 'offline-metadata') await page.route('**/latest.json', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto(`${base}/`); await page.waitForTimeout(mode === 'no-js' ? 100 : 2200);
    assert((await page.locator('[data-latest-windows-download]').first().getAttribute('href')).endsWith('.exe'));
    if (['no-js','reduced-motion','low-performance'].includes(mode)) assert.equal(await page.locator('[data-story]').evaluate(n => n.classList.contains('story-enhanced')), false);
    if (['no-webgl','reduced-motion','low-performance'].includes(mode)) assert.equal(await page.locator('.hero-device').evaluate(n => n.classList.contains('is-live')), false);
    if (mode === 'no-js') { const before = page.url(); const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-latest-windows-download]').first().click()]); assert.equal(page.url(), before); await download.cancel(); }
    report.interactions.push(mode); await context.close();
  }
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/`); await mobile.locator('.menu-toggle').press('Enter');
  assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await mobile.keyboard.press('Escape'); assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await mobile.goto(`${base}/#medical`); await mobile.locator('[data-medical-tab="1"]').click(); assert.equal(await mobile.locator('[data-medical-panel="1"]').isVisible(), true);
  await mobile.locator('.visual-medical').scrollIntoViewIfNeeded(); await mobile.screenshot({ path: join(out, 'mobile-medical-clinical.png') });
  await mobile.goto(`${base}/#presentation`); await mobile.locator('[data-ppt-page="2"]').click(); await mobile.locator('[data-ppt-mode="objects"]').click();
  await mobile.locator('.visual-presentation').scrollIntoViewIfNeeded(); await mobile.screenshot({ path: join(out, 'mobile-editable-objects.png') });
  const allAssets = await mobile.locator('img[src]').evaluateAll(nodes => { nodes.forEach(n => n.loading = 'eager'); return nodes.map(n => n.getAttribute('src')); });
  assert(allAssets.every(path => path.startsWith('/assets/v2/')), 'no legacy visible image paths');
  for (const path of new Set(allAssets)) assert.equal((await mobile.request.get(base + path)).status(), 200, path);
  report.interactions.push('mobile keyboard menu, medical switch, editable modes; every image path new and returns HTTP 200');
  await mobile.close();
  const overview = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await overview.goto(`${base}/`);
  for (const id of ['workflow','creative','download']) {
    await overview.locator(`#${id}`).scrollIntoViewIfNeeded(); await overview.waitForTimeout(900);
    await overview.screenshot({ path: join(out, `zh-1440-${id}.png`) });
  }
  for (const width of [1440,390]) {
    await overview.emulateMedia({ reducedMotion: 'reduce' }); await overview.setViewportSize({ width, height: 960 }); await overview.goto(`${base}/`);
    await overview.locator('img[src]').evaluateAll(nodes => nodes.forEach(n => n.loading = 'eager'));
    await overview.waitForFunction(() => [...document.images].filter(n => n.hasAttribute('src')).every(n => n.complete));
    await overview.screenshot({ path: join(out, `zh-${width}-full-static.png`), fullPage: true });
  }
  await overview.close();
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  report.passed = true;
} catch (error) { report.passed = false; report.failure = String(error.stack || error); console.error(report.failure); process.exitCode = 1; }
finally { await writeFile(join(out, 'browser-report.json'), JSON.stringify(report, null, 2)); await browser.close(); console.log(JSON.stringify({ passed: report.passed, layouts: report.layouts.length, downloads: report.downloads.length, errors: report.errors })); }
