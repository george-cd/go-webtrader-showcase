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

// ---- the trader ----------------------------------------------------------------------------
await signIn('anna.p@mail.example');
await page.locator('.wrow', { hasText: 'EURUSD' }).first().click();
await sleep(800);
await film('t1-trade', async () => {
  await caption('A web trading platform for brokers: live prices, charts, the order ticket');
  await sleep(2500);
  await caption('Clients type orders in plain words');
  await page.locator('#aiText').click();
  await page.keyboard.type('buy 0.2 eurusd sl 20 tp 40', { delay: 70 });
  await sleep(400);
  await page.locator('#aiSend').click();
  await sleep(1800);
  await caption('The AI only proposes: nothing happens until the client confirms');
  await sleep(2200);
  await page.locator('#aiConfirm').click();
  await sleep(1500); await clean();
  await caption('');
});
await film('t2-cost', async () => {
  await caption('Before every order: the real cost, and what a bad market would do');
  await page.locator('#tLots').fill('1.00');
  await page.getByLabel('Stop loss (pips)').fill('35');
  await sleep(600);
  await page.getByRole('button', { name: 'Real cost & stress test' }).click();
  await sleep(4000);
  await page.locator('dialog[open] .dlg-head button').last().click();
  await caption('');
}, 300);
await film('t3-calendar', async () => {
  await caption('An economic calendar for the currencies they trade');
  await page.locator('button[data-tab=calendar]').first().click();
  await sleep(1500);
  await page.locator('#newsMinutes').selectOption('15');
  await sleep(600);
  await caption('Positions can close by themselves before high-impact news');
  await sleep(2200);
  await page.locator('#newsCloseForm button').click();
  await sleep(1000); await clean();
});
// languages and the broker's brand
const admin = (await api('POST', '/api/auth/login', { email: 'dealer@broker.example', password: 'dealer-pass-123' })).token;
await api('PUT', '/api/admin/brand', { name: 'ExampleFX Trader', short: 'EX', primary: '#0ea5a4', accent: '#f59e0b', language: 'en', languages: ['en', 'el', 'es', 'ar'] }, admin);
await page.goto(BASE + '/');
await page.locator('input[autocomplete~=username]').fill('anna.p@mail.example');
await page.locator('input[autocomplete=current-password]').fill('password-123');
await page.getByRole('button', { name: 'Sign in', exact: true }).click();
await page.waitForSelector('.acc-btn'); await sleep(2500);
await page.locator('button[data-tab=positions]').first().click();
await film('t4-brand', async () => {
  await caption("The broker's own name, logo and colours");
  await sleep(2500);
  await caption('Every trader picks a language');
  await page.locator('select.lang-pick').last().selectOption('el');
  await sleep(2200);
  await page.locator('select.lang-pick').last().selectOption('es');
  await sleep(1800);
  await caption('Arabic: the whole screen turns right to left');
  await page.locator('select.lang-pick').last().selectOption('ar');
  await sleep(2800);
  await page.locator('select.lang-pick').last().selectOption('en');
  await caption('');
}, 400);
await api('PUT', '/api/admin/brand', { name: '', short: '', logo: 'remove' }, admin);

// a prop challenge
await signIn('kostas.d@mail.example');
const chNo = (await api('GET', '/api/admin/prop', null, (await api('POST', '/api/auth/login', { email: 'dealer@broker.example', password: 'dealer-pass-123' })).token)).challenges.find((c) => c.email === 'kostas.d@mail.example').number;
await page.locator('.acc-btn').click(); await sleep(500);
await page.locator('.acc-pop').getByText(String(chNo)).first().click();
await sleep(3000);
await film('t5-prop', async () => {
  await caption('Prop firm mode: the challenge, live, above the positions');
  await sleep(4500);
  await caption('Daily and maximum loss are checked on every price');
  await sleep(3000);
});
// a partner
await signIn('partners@alphafx.example');
await page.locator('button[data-tab=wallet]').first().click();
await sleep(1500);
await film('t6-partner', async () => {
  await caption('Partners (IB) see their link, their clients and their rebates');
  await page.locator('#ibBox').scrollIntoViewIfNeeded();
  await sleep(4000);
});

// ---- the dealing desk ------------------------------------------------------------------------
await signIn('dealer@broker.example', 'dealer-pass-123');
await sleep(2000);
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
await browser.close();
