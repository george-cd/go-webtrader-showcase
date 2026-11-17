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
const call = async (m, p, b, t, acc) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t, ...(acc ? { 'X-Account': String(acc) } : {}) }, body: b ? JSON.stringify(b) : undefined });
  const txt = await r.text(); if (!r.ok) throw new Error(p + ' ' + r.status + ' ' + txt); return txt ? JSON.parse(txt) : {};
};
const menu = async (label) => { await page.locator('.acc-btn').first().click(); await sleep(500); await page.locator('.acc-action', { hasText: label }).first().click(); await sleep(900); };
const stamp = Date.now();
const user = async (name, money) => {
  const email = `${name}.${stamp}@demo.example`;
  const r = await call('POST', '/api/auth/register', { email, password: 'password-123' });
  const a = await call('GET', '/api/account', null, r.token);
  await call('POST', '/api/wallet/deposits', { amount: String(money), reference: `film-${name}-${stamp}` }, r.token, a.number);
  return { email, token: r.token, number: a.number };
};

// ---- film8b: the rest of film8's scenes, with the same people ----
const S8 = process.env.STAMP; // the stamp of film8's run
const K = { email: `kostas.${S8}@demo.example` }, M = { email: `maria.${S8}@demo.example` };
await signInAt(K.email);
await film('t22-contest', async () => {
  await caption('Demo contests: one click makes a contest account; the table is live');
  await menu('Contests');
  const sec = page.locator('.contest', { hasText: 'December Cup' }).first();
  await sleep(2000);
  await sec.getByRole('button', { name: 'Table' }).click();
  await sec.locator('table.mini').waitFor({ timeout: 5000 });
  await sec.locator('table.mini').scrollIntoViewIfNeeded();
  await sleep(4500);
  await page.keyboard.press('Escape');
});
// back to his live account for the tax report and the order ticket
await signInAt(K.email);
await film('t23-tax', async () => {
  await caption('A tax report for the year: gains, losses and costs, by month and by symbol');
  await menu('Statements');
  await sleep(1000);
  await page.getByRole('button', { name: 'Tax report for a year…' }).click();
  await sleep(4500);
  await page.keyboard.press('Escape');
});
await film('t24-sentiment', async () => {
  await caption('How the broker\'s own clients stand, in the order ticket; and orders by voice 🎤');
  await page.locator('.wrow', { hasText: 'EURUSD' }).first().click();
  await page.locator('#tSentiment').waitFor({ timeout: 8000 });
  await sleep(5000);
});
// the desk
await signInAt('dealer@broker.example', '', 'dealer-pass-123');
await film('d7-programs', async () => {
  await page.locator('button', { hasText: 'Dealing desk' }).first().click();
  await sleep(1500);
  await page.locator('button', { hasText: /^Clients/ }).first().click().catch(() => {});
  await sleep(500);
  await caption('Client programs: earn your leverage, a pause before a deposit after a big loss, invite a friend, contests');
  await page.locator('button', { hasText: 'Client programs' }).first().click();
  await page.locator('#programsForm').waitFor({ timeout: 6000 });
  await sleep(4500);
  await page.mouse.wheel(0, 600);
  await sleep(3000);
});
// Maria's level (a short scene for the screenshots)
await signInAt(M.email);
await film('t25-level', async () => {
  await caption('Earn your leverage: a new client starts lower and earns the rest with careful trading');
  await menu('Leverage level');
  await page.locator('.level-bar').waitFor({ timeout: 6000 });
  await sleep(4500);
  await page.keyboard.press('Escape');
});
await browser.close();
