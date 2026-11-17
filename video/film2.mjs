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
const page = await ctx.newPage();
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
      try { const buf = await page.screenshot({ type: 'jpeg', quality: 92 }); frames.push({ t, buf }); } catch { await sleep(30); }
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
const deskTab = async (name) => {
  await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('#deskBody, .desk-body, #desk').forEach((e) => { e.scrollTop = 0; }); });
  await page.locator('#desk button', { hasText: new RegExp('^' + name.replace(/[()&]/g, '\\$&') + '$') }).first().click(); };


const call = async (m, p, b, t) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined }); const j = await r.json(); if (!r.ok) throw new Error(p + ' ' + JSON.stringify(j)); return j; };
const adm = (await call('POST', '/api/auth/login', { email: 'dealer@broker.example', password: 'dealer-pass-123' })).token;
const stamp = Date.now() % 100000;
// a trader with five quick losses
const coachEmail = `nikos.p${stamp}@mail.example`;
const ct = (await call('POST', '/api/auth/register', { email: coachEmail, password: 'password-123' })).token;
await call('POST', '/api/wallet/deposits', { amount: '10000', reference: 'v-' + coachEmail }, ct);
for (let i = 0; i < 5; i++) { const o = await call('POST', '/api/orders', { symbol: 'EURUSD', side: 'buy', lots: 0.1 }, ct); await sleep(1500); await call('POST', `/api/positions/${o.position.id}/close`, {}, ct); }
await signIn(coachEmail);
await page.locator('.wrow', { hasText: 'EURUSD' }).first().click();
await sleep(800);
await film('t7-coach', async () => {
  await caption('After five losses in a row, the trader goes for ten times the usual size…');
  await page.locator('#tLots').fill('1.00');
  await sleep(1800);
  await page.locator('button.send').click();
  await sleep(1200);
  await caption('The coach says it in plain words, before the order leaves');
  await sleep(4500);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await caption('');
}, 500);
await film('t8-replay', async () => {
  await caption('Every closed trade can be played back on the chart');
  await page.locator('button[data-tab=history]').first().click();
  await sleep(1200);
  await page.getByRole('button', { name: 'Replay' }).first().click();
  await sleep(1200);
  await page.locator('#replaySpeed').click();
  await sleep(5500);
  await page.keyboard.press('Escape');
  await caption('');
}, 400);
// a trader close to the stop-out
const mEmail = `maria.t${stamp}@mail.example`;
const mt = (await call('POST', '/api/auth/register', { email: mEmail, password: 'password-123' })).token;
await call('POST', '/api/wallet/deposits', { amount: '1000', reference: 'v-' + mEmail }, mt);
await call('POST', '/api/orders', { symbol: 'EURUSD', side: 'buy', lots: 0.25 }, mt);
const num = (await call('GET', '/api/account', null, mt)).number;
await call('PUT', '/api/admin/group-symbols', { group: 'video', symbol: 'EURUSD', leverage: 20 }, adm);
await call('PATCH', `/api/admin/accounts/${num}`, { group: 'video' }, adm);
await signIn(mEmail);
await film('t9-funds', async () => {
  await caption('Close to a stop-out: one tap to add the money that brings the account back');
  await sleep(3000);
  await page.getByRole('button', { name: /^Add .* now$/ }).hover();
  await caption("It opens the broker's payment page (e.g. the PSP Hub) with the amount filled in");
  await sleep(3500);
});
// the desk: growth and the morning report
await signIn('dealer@broker.example', 'dealer-pass-123');
await film('d5-growth', async () => {
  await caption('Growth: demo clients ready for a live account, and clients who may leave');
  await deskTab('Growth');
  await sleep(4500);
  await caption('A morning report in plain words, on the dealers\' phones at 06:30');
  await deskTab('Morning report');
  await sleep(1200);
  await page.locator('#deskBody input[type=date]').fill(new Date().toISOString().slice(0, 10));
  await page.locator('#deskBody button', { hasText: /^Show$/ }).click();
  await sleep(4200);
});
await browser.close();
