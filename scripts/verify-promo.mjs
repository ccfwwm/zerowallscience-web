import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ccf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.SITE_PREVIEW_URL || 'http://127.0.0.1:4323';
const out = resolve(process.env.BROWSER_OUTPUT_DIR || 'artifacts/video-scroll');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { checkedAt: new Date().toISOString(), base, layouts: [], playback: [], errors: [] };
try {
  for (const lang of ['zh', 'en']) for (const width of [1440, 1280, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 960 } });
    let videoRequests = 0;
    page.on('request', request => { if (request.url().endsWith('/zerowallsciencevideo.mp4')) videoRequests++; });
    page.on('pageerror', error => report.errors.push(`${lang}/${width}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(`${lang}/${width}: ${message.text()}`); });
    await page.goto(`${base}${lang === 'en' ? '/en/' : '/'}?video-check=${width}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-video-play]').waitFor({ state: 'visible' });
    assert.equal(videoRequests, 0, 'No MP4 requests before user playback');
    assert.equal(await page.locator('.film-caption, .ppt-sample-link, a[href="/samples/zerowall-editable-research.pptx"]').count(), 0, 'Removed captions and sample download are absent');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if ([1440, 390].includes(width)) await page.screenshot({ path: join(out, `${lang}-${width}-hero.png`) });
    await page.locator('.hero-copy a[href="#film"]').click();
    assert.equal(new URL(page.url()).hash, '#film');
    const geometry = await page.locator('.film-player').boundingBox();
    assert(Math.abs(geometry.width / geometry.height - 16 / 9) < .02, '16:9 video geometry');
    assert(geometry.x >= 0 && geometry.x + geometry.width <= width, 'Video within viewport');
    await page.locator('#film').screenshot({ path: join(out, `${lang}-${width}-film.png`) });
    const chapters = await page.locator('.story-panel').evaluateAll(nodes => nodes.map(node => ({
      top: node.getBoundingClientRect().top + scrollY, height: node.getBoundingClientRect().height,
      position: getComputedStyle(node).position, hidden: node.getAttribute('aria-hidden'), inert: node.inert,
    })));
    chapters.forEach((chapter, index) => {
      assert(chapter.position !== 'absolute' && !chapter.inert && chapter.hidden !== 'true');
      if (index) assert(chapter.top >= chapters[index - 1].top + chapters[index - 1].height - 1, 'Chapters do not overlay or lock');
    });
    await page.locator('#agent').scrollIntoViewIfNeeded();
    const before = await page.locator('#agent').evaluate(node => ({ y: scrollY, top: node.getBoundingClientRect().top }));
    await page.mouse.wheel(0, 420);
    await page.waitForFunction(y => scrollY > y + 200, before.y);
    const after = await page.locator('#agent').evaluate(node => ({ y: scrollY, top: node.getBoundingClientRect().top }));
    assert(Math.abs((before.top - after.top) - (after.y - before.y)) < 2, 'Content follows native wheel movement');
    report.layouts.push({ lang, width, videoAspectRatio: true, noPrematureVideoRequest: true, nativeWheel: true, chaptersInDocumentFlow: true, overflow: false });
    if (lang === 'zh' && [1440, 390].includes(width)) {
      const playPage = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 960 } });
      await playPage.goto(`${base}/?playback-check=${width}#film`);
      await playPage.locator('[data-video-play]').waitFor({ state: 'visible' });
      await playPage.locator('.film-player').scrollIntoViewIfNeeded();
      await playPage.waitForFunction(() => { const box = document.querySelector('.film-player').getBoundingClientRect(); return box.top >= 0 && box.bottom <= innerHeight; });
      await playPage.locator('[data-video-play]').focus();
      await playPage.keyboard.press('Enter');
      await playPage.waitForFunction(() => { const v = document.querySelector('video'); return !v.paused && v.currentTime > .3 && v.readyState >= 2; }, null, { timeout: 45000 });
      const playback = await playPage.locator('video').evaluate(video => ({ width: video.videoWidth, height: video.videoHeight, duration: video.duration, controls: video.controls, inline: video.playsInline, time: video.currentTime }));
      assert.equal(playback.width, 2560); assert.equal(playback.height, 1440); assert(playback.duration > 15 && playback.duration < 16);
      assert(playback.controls && playback.inline);
      assert.equal(await playPage.locator('[data-video-play]').isVisible(), false);
      assert.equal(await playPage.locator('video').evaluate(video => video === document.activeElement), true, 'Keyboard focus transfers to video');
      await playPage.waitForFunction(() => document.querySelector('video').currentTime > 1.7);
      await playPage.locator('.film-player').screenshot({ path: join(out, `playing-${width}.png`) });
      await playPage.locator('video').evaluate(video => { video.currentTime = 8; });
      await playPage.waitForFunction(() => { const video = document.querySelector('video'); return !video.seeking && video.currentTime >= 8 && video.readyState >= 2; });
      await playPage.locator('#agent').scrollIntoViewIfNeeded();
      await playPage.waitForFunction(() => document.querySelector('video').paused);
      const pausedTime = await playPage.locator('video').evaluate(video => video.currentTime);
      await playPage.locator('.film-player').scrollIntoViewIfNeeded();
      assert.equal(await playPage.locator('video').evaluate(video => video.paused), true, 'Returning does not restart sound');
      report.playback.push({ viewportWidth: width, ...playback, seek: true, offscreenPaused: true, pausedTime, noAutoResume: true });
      await playPage.close();
    }
    await page.close();
  }
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(base + '/#film');
  assert.equal(await noJs.locator('video').getAttribute('controls'), '');
  assert.equal(await noJs.locator('[data-video-play]').isVisible(), false);
  report.noJavaScriptNativeControls = true; await noJs.close();
  const failure = await browser.newPage();
  await failure.route('**/zerowallsciencevideo.mp4', route => route.fulfill({ status: 503, body: '' }));
  await failure.goto(base + '/#film');
  await failure.locator('[data-video-play]').waitFor({ state: 'visible' });
  await failure.locator('[data-video-play]').click();
  await failure.locator('[data-video-error]').waitFor({ state: 'visible' });
  assert.equal(await failure.locator('[data-video-play]').isEnabled(), true);
  await failure.unroute('**/zerowallsciencevideo.mp4');
  await failure.locator('[data-video-play]').click();
  await failure.waitForFunction(() => { const video = document.querySelector('video'); return !video.paused && video.currentTime > .3; }, null, { timeout: 30000 });
  report.failureRetryAndOriginalLink = true; await failure.close();
  assert.deepEqual(report.errors, []); report.passed = true;
} catch (error) { report.passed = false; report.failure = String(error.stack || error); process.exitCode = 1; }
finally { await browser.close(); await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report)); }
