// film.mjs — films the platform as JPEG frames per scene (with the time of each frame).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
const BASE = 'http://localhost:8097', OUT = '/tmp/video/scenes/';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const api = async (m, p, b, t) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined });
  return r.json();
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { if (!sessionStorage.getItem('demoWelcome')) { localStorage.setItem('wt-desk-welcome', 'done'); localStorage.setItem('wt-desk-help', 'on'); } });
const page = await ctx.newPage();
let shot = page; // the page being filmed (the print window for a moment)
page.on('pageerror', (e) => console.log('ERR', e.message));

// the caption at the bottom of the screen
const caption = (text) => page.evaluate((t) => {
  let d = document.getElementById('demoCap');
  if (!d) {
    d = document.createElement('div'); d.id = 'demoCap'; d.setAttribute('data-no-i18n', '');
    d.style.cssText = 'position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:99999;background:rgba(8,12,22,.92);color:#fff;font:600 22px/1.35 Inter,system-ui,sans-serif;padding:12px 22px;border-radius:12px;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.45);max-width:1100px;text-align:center;pointer-events:none;transition:opacity .25s';
    document.body.appendChild(d);
  }
  d.textContent = t; d.style.opacity = t ? '1' : '0';
}, text);
const clean = () => page.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));

// film: frames while `fn` runs, then `hold` ms more
async function film(name, fn, hold = 1200) {
  if (ONLY && !ONLY.includes(name)) { await fn(); return; }
  const dir = OUT + name + '/';
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const frames = []; let stop = false;
  const loop = (async () => {
    while (!stop) {
      const t = Date.now();
      try { const buf = await shot.screenshot({ type: "jpeg", quality: 92 }); frames.push({ t, buf }); } catch { await sleep(30); }
    }
  })();
  await fn();
  await sleep(hold);
  stop = true; await loop;
  let list = '';
  frames.forEach((f, i) => {
    const file = `f${String(i).padStart(5, '0')}.jpg`;
    writeFileSync(dir + file, f.buf);
    const d = i + 1 < frames.length ? (frames[i + 1].t - f.t) / 1000 : 0.1;
    list += `file '${file}'\nduration ${d.toFixed(3)}\n`;
  });
  list += `file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  writeFileSync(dir + 'list.txt', list);
  console.log(name, frames.length, 'frames', ((frames.at(-1).t - frames[0].t) / 1000).toFixed(1) + 's');
}

const signIn = async (email, pw = 'password-123') => {
  await page.goto(BASE + '/');
  await page.locator('input[autocomplete~=username]').fill(email);
  await page.locator('input[autocomplete=current-password]').fill(pw);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForSelector('.acc-btn', { timeout: 10000 });
  await sleep(2500);
};
// the desk now has five groups: open the group that holds the screen, then the screen
const deskTab = async (name) => {
  await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('#deskBody, .desk-body, #desk').forEach((e) => { e.scrollTop = 0; }); });
  const re = new RegExp('^' + name.replace(/[()&]/g, '\\$&') + '$');
  for (const g of await page.locator('.desk-groups button').all()) {
    const t = page.locator('.desk-tabs button', { hasText: re });
    if (await t.count()) { await t.first().click(); return; }
    await g.click(); await sleep(150);
  }
  await page.locator('.desk-tabs button', { hasText: re }).first().click();
};

await page.goto(BASE + '/');
await page.locator('input[autocomplete~=username]').fill('dealer@broker.example');
await page.locator('input[autocomplete=current-password]').fill('dealer-pass-123');
await page.getByRole('button', { name: 'Sign in', exact: true }).click();
await page.waitForSelector('.desk-groups', { timeout: 10000 });
await sleep(2500);
await film('d6-mam', async () => {
  await caption('The desk: every money manager, their investors and the fees');
  await deskTab('Managers (MAM)');
  await sleep(4200);
  await caption('Credit (bonus) and swap-free (Islamic) accounts, with the broker\'s rules');
  await deskTab('Credit & swap-free');
  await sleep(4000);
});
await browser.close();
