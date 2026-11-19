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
// the caption must be inside an open window (dialog), or the window covers it
await ctx.addInitScript(() => setInterval(() => {
  const d = document.getElementById('demoCap');
  if (!d) return;
  const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
  if (d.parentElement !== host) host.appendChild(d);
}, 40));
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
const signInAt = async (email, query = '', pw = 'password-123') => {
  await page.goto(BASE + '/' + query);
  await page.locator('input[autocomplete~=username]').fill(email);
  await page.locator('input[autocomplete=current-password]').fill(pw);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForSelector('.acc-btn', { timeout: 10000 });
  await sleep(2500);
};
// the dealing desk: behaviour, automations, routing report, several LPs
await signInAt('dealer@broker.example', '', 'dealer-pass-123');
const deskTab = async (group, tab) => {
  await page.locator(`[data-group=${group}]`).click(); await sleep(400);
  await page.locator('.desk-tabs button', { hasText: tab }).first().click(); await sleep(400);
};
await page.locator('button', { hasText: 'Dealing desk' }).first().click();
await sleep(1500);
await film('d8-behaviour', async () => {
  await caption('Behaviour: 19 kinds of traders, each with the reason — latency arbitrage, news, scalpers, martingale');
  await deskTab('clients', 'Behaviour');
  await clean(); await sleep(4000);
  await page.mouse.wheel(0, 650); await sleep(1500);
  await caption('Accounts of different people that open the same trade within seconds, and trades around high-impact news');
  await sleep(4000);
  await page.mouse.wheel(0, -2000); await sleep(400);
  await caption('Every client shows their behaviours; a harmful one reaches the dealer\'s phone');
  await deskTab('clients', 'Clients'); await clean();
  await sleep(4000);
  await caption('Automations: when this happens, do that — without code, once a day per client');
  await deskTab('risk', 'Automations'); await clean();
  await sleep(5000);
  await caption('The routing report: what the A/B decisions were worth, and how each LP filled');
  await deskTab('risk', 'Routing report'); await clean();
  await sleep(3500);
  await page.mouse.wheel(0, 600); await sleep(2500);
  await page.mouse.wheel(0, -2000); await sleep(300);
  await caption('Several LPs: the best price across them, big orders split into parts');
  await deskTab('setup', 'LP connection'); await clean();
  await sleep(4500);
  await caption('');
});
await browser.close();
