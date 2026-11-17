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

// ---- the data: a manager with two investors and a closed trade ----
const M = await user('elena.manager', 25000), A = await user('nikos.investor', 6000), B = await user('maria.investor', 12000), C = await user('andreas.investor', 8000);
await call('PATCH', '/api/account', { name: 'Elena · managed' }, M.token, M.number).catch(() => {});
const m = await call('PUT', '/api/account/mam', { name: 'Steady Crypto Fund', perf_fee: 20, mgmt_fee: 2, open: true, public: true }, M.token, M.number);
await call('POST', '/api/account/mam/join', { code: m.mam.code, guard_loss: 15, guard_close: true }, A.token, A.number);
await call('POST', '/api/account/mam/join', { code: m.mam.code, alloc: 'lots', multiplier: 0.5, guard_loss: 20 }, B.token, B.number);
// two trades closed in profit (the demo prices move at random: wait for a good moment, at most 2 minutes)
for (const [sym, lots, want] of [['ETHUSD', 5, 6], ['BTCUSD', 0.5, 8]]) { // want: the profit in USD to close at
  for (let side of ['buy', 'sell']) {
    const o = await call('POST', '/api/orders', { symbol: sym, side, lots }, M.token, M.number);
    let done = false;
    for (let i = 0; i < 90 && !done; i++) {
      await sleep(2000);
      const a = await call('GET', '/api/account', null, M.token, M.number);
      const p = a.positions.find((x) => x.id === o.position.id);
      if (p && parseFloat(p.profit) >= want) {
        await call('POST', '/api/positions/' + p.id + '/close', {}, M.token, M.number); done = true;
      }
    }
    if (done) { console.log(sym, 'closed in profit'); break; }
    await call('POST', '/api/positions/' + o.position.id + '/close', {}, M.token, M.number); // not this way: try the other side
  }
}
await call('POST', '/api/orders', { symbol: 'BTCUSD', side: 'buy', lots: 0.1 }, M.token, M.number);
console.log('manager', M.number, 'code', m.mam.code);

// ---- 1. an investor joins with the invite link ----
await signInAt(C.email, '?mam=' + m.mam.code);
await film('t10-mam', async () => {
  await page.locator('#mamInvest form').waitFor({ timeout: 8000 });
  await caption('An investor opens the manager\'s invite link: the results and the fees come first');
  await sleep(4200);
  const f = page.locator('#mamInvest form');
  await caption('Their own limit (our idea): leave the manager if I lose 15%, and close the copied trades');
  await f.getByLabel(/My limit/).click(); await sleep(300);
  await f.getByLabel(/My limit/).pressSequentially('15', { delay: 120 });
  await sleep(2600);
  await f.getByRole('button', { name: /^Join / }).click();
  await caption('Joined: every new trade of the manager is split to this account, live');
  await sleep(2400);
  await page.keyboard.press('Escape');
  await call('POST', '/api/orders', { symbol: 'ETHUSD', side: 'buy', lots: 1 }, M.token, M.number);
  await sleep(3200);
  await clean();
  await sleep(1200);
});

// ---- 2. the cost saver, close by, stop limit ----
await call('POST', '/api/orders', { symbol: 'BTCUSD', side: 'buy', lots: 0.05 }, C.token, C.number);
await call('POST', '/api/orders', { symbol: 'BTCUSD', side: 'sell', lots: 0.05 }, C.token, C.number);
await sleep(2500);
await film('t11-saver', async () => {
  await caption('The cost saver: a buy and a sell cancel each other. Close By closes both without the spread');
  await page.locator('#saverBanner').waitFor({ timeout: 6000 });
  await sleep(3800);
  await page.locator('#saverBanner button', { hasText: 'Close By' }).first().click();
  await sleep(2500);
  await clean();
  await caption('Stop Limit, as in MT5: after the breakout, buy only at a better price');
  await page.locator('.wrow', { hasText: 'ETHUSD' }).first().click();
  await sleep(600);
  await page.locator('select', { has: page.locator('option[value=stoplimit]') }).first().selectOption('stoplimit');
  await sleep(3800);
});

// ---- 3. statements and breaks ----
await film('t12-statement', async () => {
  await caption('Daily and monthly statements: every movement and every trade, to print or save as PDF');
  await menu('Statements');
  await page.locator('#stmtOut').waitFor({ timeout: 6000 });
  await sleep(2600);
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.getByRole('button', { name: 'Print / Save as PDF' }).click()]);
  await pop.setViewportSize({ width: 1440, height: 900 });
  await pop.waitForLoadState();
  shot = pop; await sleep(3800); shot = page;
  await pop.close();
  await page.keyboard.press('Escape');
  await caption('Breaks and a reality check, for calm trading: a break cannot be ended early');
  await menu('Breaks');
  await sleep(4500);
  await page.keyboard.press('Escape');
});

// ---- 4. the manager's view ----
await signInAt(M.email);
await film('t13-manager', async () => {
  await caption('The manager: the invite code, the investors, the money managed and the fees');
  await menu('Money manager');
  await page.locator('#mamManage').scrollIntoViewIfNeeded();
  await sleep(5200);
  await page.keyboard.press('Escape');
});

// ---- 5. the public track record ----
await film('t14-track', async () => {
  await page.goto(`${BASE}/track.html?n=${M.number}`);
  await caption('A public track record anyone can open: results from the journal, which nobody can rewrite');
  await sleep(3800);
  await page.mouse.wheel(0, 700);
  await sleep(3200);
});

// the desk scene (d6-mam) is in film5.mjs
await browser.close();
