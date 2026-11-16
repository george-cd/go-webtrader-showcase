// cards.mjs: draws the pitch title cards and the frames that hold the screen recordings.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const OUT = '/tmp/pitch/img/';
const BG = 'background:radial-gradient(1300px 800px at 15% 0%, #1d3266 0%, #0a1020 62%)';
const LOGO = `<div style="display:flex;align-items:center;gap:12px;font-size:22px;font-weight:700"><span style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#5b8cff,#1fc28b);display:grid;place-items:center;font-size:15px">GW</span>Go WebTrader</div>`;
const page = (inner, pad = '0 130px') => `<html><body style="margin:0;width:1440px;height:900px;${BG};color:#eef3ff;font-family:Inter,system-ui,sans-serif;box-sizing:border-box;padding:${pad};display:flex;flex-direction:column;justify-content:center;position:relative">${inner}</body></html>`;
const K = (t, c = '#6f9bff') => `<div style="color:${c};font-size:21px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:20px">${t}</div>`;
const T = (t, s = 72) => `<div style="font-family:'Inter Display',Inter;font-size:${s}px;font-weight:800;line-height:1.06;letter-spacing:-.025em">${t}</div>`;
const S = t => `<div style="font-size:28px;color:#a3b1cf;margin-top:30px;line-height:1.45;max-width:1080px">${t}</div>`;
const SRC = t => `<div style="position:absolute;left:130px;bottom:38px;font-size:15px;color:#6b7896">${t}</div>`;
const G = t => `<span style="background:linear-gradient(90deg,#6f9bff,#2fd39a);-webkit-background-clip:text;color:transparent">${t}</span>`;
const shot = async (name, html) => { await p.setContent(html); await p.waitForTimeout(250); await p.screenshot({ path: OUT + name, type: name.endsWith('.png') ? 'png' : 'jpeg', ...(name.endsWith('.jpg') ? { quality: 95 } : {}) }); };

// 1. hook
await shot('c1-hook.jpg', page(LOGO.replace('display:flex', 'position:absolute;top:60px;left:130px;display:flex') + K('Online trading today') +
  T(`Millions of people trade online.<br>Almost all of them on ${G('one company’s software.')}`, 70) +
  S('Brokers rent it. They can’t change it. And they can’t easily leave.')));

// 2. market numbers
const tile = (n, l) => `<div style="flex:1;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:22px;padding:38px 34px"><div style="font-family:'Inter Display',Inter;font-size:76px;font-weight:800;letter-spacing:-.03em">${G(n)}</div><div style="font-size:23px;color:#b7c3dd;margin-top:14px;line-height:1.4">${l}</div></div>`;
await shot('c2-market.jpg', page(K('The market') + T('A big market, with one supplier.', 60) +
  `<div style="display:flex;gap:26px;margin-top:54px">${tile('6.8M', 'active trading accounts at online brokers (end of 2025)')}${tile('84%', 'of that trading runs on MetaTrader, from one company: MetaQuotes')}${tile('$20–25k', 'a month, what a broker pays MetaQuotes for MT4 + MT5 (estimate, 2025)')}</div>` +
  SRC('Sources: Finance Magnates Intelligence (Q3 & Q4 2025); Finance Magnates on MetaQuotes fees, Jan 2025.')));

// 3. problem
const row = (y, t) => `<div style="display:flex;gap:28px;align-items:baseline;padding:20px 0;border-top:1px solid rgba(255,255,255,.08)"><div style="flex:none;width:120px;font-size:26px;font-weight:800;color:#ff7b7b">${y}</div><div style="font-size:28px;line-height:1.4;color:#dbe3f5">${t}</div></div>`;
await shot('c3-problem.jpg', page(K('The problem', '#ff8a8a') + T('One supplier. Rising prices.<br>No control.', 66) +
  `<div style="margin-top:44px;max-width:1150px">${row('2022', 'Apple pulled MetaTrader from the App Store for six months. Brokers lost new iPhone clients overnight.')}${row('2022', 'MetaQuotes stopped issuing new MT5 white labels. Small brokers lost the cheap way in.')}${row('2025', 'Licence fees went up again. Brokers had no choice but to pay.')}</div>` +
  SRC('Sources: Finance Magnates, Sept 2022 & Mar 2023; B2Broker; Finance Magnates, Jan 2025.')));

// 4. answer
await shot('c4-answer.jpg', page(K('The answer', '#2fd39a') + T(`A complete trading platform<br>${G('the broker owns.')}`, 74) +
  S('The trading app, the dealing desk, the back office and the phone app — on the broker’s own servers, under the broker’s own name. No monthly rent to a supplier who can change the rules.')));

// 5. section card
await shot('c5-built.jpg', page(K('Not a slide deck') + T('Everything you’ll see next<br>is already built and working.', 66) +
  S('Real screens from the running platform. Demo money, real software.')));

// 6. stack comparison
const li = (t, c) => `<div style="padding:15px 22px;border-radius:12px;background:${c};font-size:23px;margin-top:12px">${t}</div>`;
await shot('c6-stack.jpg', page(K('The difference') + T('Others sell parts.<br>This is the whole thing.', 62) +
  `<div style="display:flex;gap:40px;margin-top:44px">
    <div style="flex:1"><div style="font-size:20px;color:#8f9cb8;font-weight:700;letter-spacing:.08em;text-transform:uppercase">A broker’s setup today</div>
      ${['Trading platform — rented from MetaQuotes', 'Link to the banks — another vendor', 'Copy trading & money managers — another vendor', 'Risk tools & reports — another vendor', 'Phone app — tied to the supplier'].map(t => li(t, 'rgba(255,120,120,.08)')).join('')}
      <div style="font-size:20px;color:#ff9a9a;margin-top:16px">Five contracts. Five invoices. Gaps between them.</div></div>
    <div style="flex:1"><div style="font-size:20px;color:#2fd39a;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Go WebTrader</div>
      ${li('<b>One product.</b> All of the above, built to work together', 'rgba(47,211,154,.12)')}
      ${li('Owned by the broker — runs on their servers', 'rgba(47,211,154,.08)')}
      ${li('Their brand, their languages, their rules', 'rgba(47,211,154,.08)')}
      ${li('AI built in, with the client always in control', 'rgba(47,211,154,.08)')}
      ${li('Changes in days, not years', 'rgba(47,211,154,.08)')}</div></div>`));

// 7. what is built (facts from the code)
const f = (n, l) => `<div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:26px 28px"><div style="font-family:'Inter Display',Inter;font-size:54px;font-weight:800;letter-spacing:-.02em">${G(n)}</div><div style="font-size:21px;color:#b7c3dd;margin-top:8px">${l}</div></div>`;
await shot('c7-facts.jpg', page(K('Where it stands') + T('Built. Tested. Ready to pilot.', 62) +
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:46px">${f('32,000', 'lines of server code')}${f('231', 'automated tests')}${f('~1,650', 'orders a second on one server')}${f('3', 'apps: web, React, phone')}${f('4', 'languages, incl. Arabic')}${f('0', 'trades lost after a restart')}</div>`));

// 8. business model
await shot('c8-model.jpg', page(K('How it makes money') + T('A monthly licence per broker.', 62) +
  `<div style="display:flex;gap:26px;margin-top:46px">${tile('808', 'investment firms regulated in Cyprus alone — one of many licensing hubs')}${tile('Under', 'what brokers pay MetaQuotes today, so switching saves them money')}${tile('+ extras', 'setup, branding, custom features, hosting and support')}</div>` +
  `<div style="font-size:26px;color:#dbe3f5;margin-top:40px">Example: <b>10 brokers × $10,000 a month = $1.2M a year</b> in recurring revenue.</div>` +
  SRC('Source: CySEC, 2026 (via Track360). The revenue line is an example, not a forecast.')));

// 9. ask + end
await shot('c9-ask.jpg', page(K('The ask', '#2fd39a') + T(`Back us to put it in front of<br>${G('the first brokers.')}`, 68) +
  `<div style="font-size:27px;color:#dbe3f5;margin-top:40px;line-height:1.7">✓ &nbsp;Independent security audit and certification<br>✓ &nbsp;A first live pilot with a regulated broker<br>✓ &nbsp;Sales and support to reach the next ten</div>`));
await shot('c10-end.jpg', page(`<div style="display:flex;flex-direction:column;align-items:center;text-align:center">
  <span style="width:96px;height:96px;border-radius:24px;background:linear-gradient(135deg,#5b8cff,#1fc28b);display:grid;place-items:center;font-size:38px;font-weight:800">GW</span>
  <div style="font-family:'Inter Display',Inter;font-size:78px;font-weight:800;letter-spacing:-.03em;margin-top:34px">Go WebTrader</div>
  <div style="font-size:30px;color:#a3b1cf;margin-top:14px">The broker’s own trading platform.</div>
  <div style="font-size:24px;color:#dbe3f5;margin-top:56px">George Drakou</div>
  <div style="font-size:16px;color:#6b7896;margin-top:60px">Screens show demo data. Trading CFDs carries a high risk of losing money.</div></div>`));

// frames for the screen recordings: a headline on top, a dark well where the video goes
const frame = async (name, kicker, title) => shot(name, `<html><body style="margin:0;width:1440px;height:900px;${BG};color:#eef3ff;font-family:Inter,system-ui,sans-serif;position:relative">
  <div style="position:absolute;left:130px;top:44px;right:130px">
    <div style="color:#6f9bff;font-size:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${kicker}</div>
    <div style="font-family:'Inter Display',Inter;font-size:40px;font-weight:800;line-height:1.12;letter-spacing:-.02em;margin-top:10px">${title}</div></div>
  <div style="position:absolute;left:126px;top:256px;width:1188px;height:618px;border-radius:14px;background:#000;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12)"></div></body></html>`);
const F = JSON.parse(process.argv[2] || '[]');
for (const [n, k, t] of F) await frame(n, k, t);
await b.close();
