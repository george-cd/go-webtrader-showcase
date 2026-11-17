import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const card = async (file, kicker, title, sub) => {
  await p.setContent(`<html><body style="margin:0;width:1440px;height:900px;background:radial-gradient(1200px 700px at 20% 10%, #1b2d55 0%, #0b1220 60%);color:#e8eefc;font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 140px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:14px;font-size:26px;font-weight:700;margin-bottom:46px"><span style="width:44px;height:44px;border-radius:11px;background:linear-gradient(135deg,#5b8cff,#1fc28b);display:grid;place-items:center;font-size:18px">GW</span>Go WebTrader</div>
    <div style="color:#5b8cff;font-size:22px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px">${kicker}</div>
    <div style="font-size:68px;font-weight:700;line-height:1.08;letter-spacing:-.02em;max-width:1100px">${title}</div>
    <div style="font-size:28px;color:#9aa8c4;margin-top:28px;max-width:1050px;line-height:1.4">${sub}</div></body></html>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: '/tmp/video/cards/' + file, type: 'jpeg', quality: 95 });
};
await card('c0-intro.jpg', 'A web trading platform for brokers', 'Trading, risk and AI on one screen.', 'Built in Go, with two front-ends: plain JavaScript and React. Installed on the broker\'s own servers.');
await card('c1-desk.jpg', 'For the broker', 'The dealing desk, and the whole business.', 'A real liquidity provider, partners, prop-firm programs, the regulator\'s rules, backups and a standby server.');
await card('c2-end.jpg', 'In short', 'Ready for real money.', 'Nothing lost after a restart · about 1,650 orders a second on one server · English, Greek, Spanish, Arabic · your own brand.<br><br><span style="font-size:20px;color:#6b7891">Demo data. The source code is private.</span>');
await b.close();
