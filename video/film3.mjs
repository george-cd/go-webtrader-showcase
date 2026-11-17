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

// ---- the dealing desk ------------------------------------------------------------------------
await signIn('dealer@broker.example', 'dealer-pass-123');
await sleep(2000);
let token = '';
page.on('request', (r) => { const a = r.headers()['authorization']; if (a) token = a; });
const news = (on) => page.evaluate(async ([a, on]) => fetch('/api/admin/desk/news', { method: 'POST', headers: { 'content-type': 'application/json', authorization: a }, body: JSON.stringify(on ? { on: true, minutes: 10, reason: 'NFP' } : { on: false, reason: 'demo done' }) }), [token, on]);
await film('d0-needs', async () => {
  await caption('The desk shows what needs the dealer now: each line opens the right screen');
  await sleep(4000);
  await caption('Something new appears, and a short sound plays (each kind has its own)');
  await news(true);
  await sleep(4000);
  await page.getByRole('button', { name: /Sounds/ }).first().click();
  await caption('Sounds on or off, the volume, and which events: each dealer chooses');
  await sleep(4500);
  await page.getByRole('button', { name: /Sounds/ }).first().click();
  await caption('23 screens in five groups, with two lines of help on every screen');
  await deskTab('Liquidation map');
  await sleep(2200);
  await deskTab('Symbols');
  await sleep(2200);
  await news(false);
  await deskTab('Overview');
  await sleep(600);
});
await film('d1-overview', async () => {
  await caption("The dealing desk: the broker's book, live");
  await sleep(4000);
  await caption('Every client scored: toxic flow is found in minutes');
  await deskTab('Clients');
  await sleep(3500);
});
await film('d2-lp', async () => {
  await caption('A real liquidity provider over FIX: cTrader (Pepperstone, IC Markets…)');
  await deskTab('LP connection');
  await sleep(4000);
  await caption('A-book trades and hedges are executed at the LP, with the slippage');
  await page.mouse.wheel(0, 900);
  await sleep(3000);
});
await film('d3-business', async () => {
  await caption('Partners: rebates per lot, two levels, paid when trades close');
  await deskTab('Partners (IB)');
  await sleep(3200);
  await caption('Prop firm: programs, phases and every challenge');
  await deskTab('Prop firm');
  await sleep(3200);
  await caption("The regulator's rules: leverage limits, negative balance protection, reports");
  await deskTab('Regulation');
  await sleep(3500);
});
await film('d4-ops', async () => {
  await caption('News mode switches on by itself around high-impact announcements');
  await deskTab('Calendar');
  await sleep(3500);
  await caption('A standby server, automatic backups and monitoring');
  await deskTab('System');
  await sleep(3500);
});


// growth and the morning report (from film2.mjs)
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
