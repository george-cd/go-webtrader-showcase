// film.mjs — films the platform as JPEG frames per scene (with the time of each frame).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
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
  if (window.__capTop) { d.style.top = '24px'; d.style.bottom = 'auto'; } else { d.style.top = ''; d.style.bottom = '44px'; }
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

// ---- film6: what-if, the manager's monthly report, the statement in plain words, the phone app ----
// the manager made by trade.mjs, with a real profitable history
const MJ = JSON.parse(readFileSync('/tmp/video/manager.json', 'utf8'));
const mEmail = MJ.email;
const ml = await call('POST', '/api/auth/login', { email: mEmail, password: 'password-123' }).catch(async () => (await fetch(BASE + '/api/auth/login', { method: 'POST', body: JSON.stringify({ email: mEmail, password: 'password-123' }) })).json());
const M = { email: mEmail, token: ml.token, number: MJ.number };
const m = await call('GET', '/api/account/mam', null, M.token, M.number);
const C = await user('petros.investor', 9000), D = await user('eleni.investor', 15000);
await call('POST', '/api/account/mam/join', { code: m.mam.code, guard_loss: 15, guard_close: true }, D.token, D.number);
console.log('manager', M.number, 'code', m.mam.code);

// 1. what if I had joined
await signInAt(C.email, '?mam=' + m.mam.code);
await film('t15-whatif', async () => {
  await page.locator('#whatIf p', { hasText: 'you would have' }).waitFor({ timeout: 8000 });
  await page.locator('#whatIf').scrollIntoViewIfNeeded();
  await page.evaluate(() => { window.__capTop = true; });
  await caption('Before joining (our idea): what if I had joined with my money? The real result, after the fees');
  await sleep(4200);
  const f = page.locator('#mamInvest form');
  await caption('With my own loss limit: would it have stopped me out? The answer, with the curve');
  await f.getByLabel(/My limit/).click(); await f.getByLabel(/My limit/).fill('');
  await f.getByLabel(/My limit/).pressSequentially('10', { delay: 140 });
  await page.locator('#whatIf button', { hasText: 'Calculate' }).click();
  await page.locator('#whatIf p', { hasText: 'Your limit of 10%' }).waitFor({ timeout: 5000 });
  await page.locator('#whatIf').scrollIntoViewIfNeeded();
  await sleep(4200);
  await page.evaluate(() => { window.__capTop = false; });
  await page.keyboard.press('Escape');
});

// 2. the manager writes the monthly report, the investor reads it (a second window for the investor)
const inv = await ctx.newPage();
await inv.goto(BASE + '/');
await inv.locator('input[autocomplete~=username]').fill(D.email);
await inv.locator('input[autocomplete=current-password]').fill('password-123');
await inv.getByRole('button', { name: 'Sign in', exact: true }).click();
await inv.waitForSelector('.acc-btn', { timeout: 10000 }); await sleep(2000);
await signInAt(M.email);
await film('t16-report', async () => {
  await caption('The manager writes the monthly report: the numbers are filled in by the platform');
  await menu('Money manager');
  await page.locator('#mamManage textarea').scrollIntoViewIfNeeded();
  await page.locator('#mamManage textarea').pressSequentially('A good month: short trades in the euro, one small loss. Next month we also look at gold.', { delay: 28 });
  await sleep(800);
  await page.getByRole('button', { name: "Send this month's report" }).click();
  await sleep(2200);
  shot = inv;   // now film the investor's screen
  await inv.evaluate(() => { const d = document.createElement('div'); d.id = 'demoCap'; d.setAttribute('data-no-i18n', ''); d.style.cssText = 'position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:99999;background:rgba(8,12,22,.92);color:#fff;font:600 22px/1.35 Inter,system-ui,sans-serif;padding:12px 22px;border-radius:12px;border:1px solid rgba(255,255,255,.14);max-width:1100px;text-align:center'; d.textContent = 'Every investor gets it at once, with a notice on the phone'; document.body.appendChild(d); });
  await inv.locator('.acc-btn').first().click(); await sleep(500);
  await inv.locator('.acc-action', { hasText: 'Money manager' }).first().click(); await sleep(900);
  await inv.locator('#mamInvest .report').first().scrollIntoViewIfNeeded();
  await sleep(4500);
  shot = page;
  await page.keyboard.press('Escape');
});

// 3. the statement in plain words (the manager's own account: today's trades)
await film('t17-explain', async () => {
  await caption('The statement explains itself in plain words: what happened, what it cost, what to watch');
  await menu('Statements');
  await sleep(1200);
  await page.locator('#stmtOut ul.explain li').first().waitFor({ timeout: 8000 });
  await page.locator('#stmtOut ul.explain').scrollIntoViewIfNeeded();
  await sleep(6000);
  await page.keyboard.press('Escape');
});
await browser.close();
console.log('investor for the phone', D.email);
