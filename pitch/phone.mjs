// phone.mjs: the background for the phone scene: text on the left, a phone body on the right
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const G = t => `<span style="background:linear-gradient(90deg,#6f9bff,#2fd39a);-webkit-background-clip:text;color:transparent">${t}</span>`;
await p.setContent(`<html><body style="margin:0;width:1440px;height:900px;background:radial-gradient(1300px 800px at 15% 0%, #1d3266 0%, #0a1020 62%);color:#eef3ff;font-family:Inter,system-ui,sans-serif;position:relative">
  <div style="position:absolute;left:130px;top:250px;width:640px">
    <div style="color:#6f9bff;font-size:20px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">For the broker · the phone app</div>
    <div style="font-family:'Inter Display',Inter;font-size:54px;font-weight:800;line-height:1.08;letter-spacing:-.025em;margin-top:16px">${G('Their own app')}<br>for iPhone and Android.</div>
    <div style="font-size:25px;color:#a3b1cf;margin-top:28px;line-height:1.5">The same platform, in the broker’s name, from the app stores. Trading, money managers and statements — everything works in the app.</div>
  </div>
  <div style="position:absolute;left:880px;top:56px;width:474px;height:788px;border-radius:54px;background:#05070d;box-shadow:0 40px 90px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.16)"></div>
</body></html>`);
await p.waitForTimeout(300);
await p.screenshot({ path: '/tmp/pitch/img/f11.png' });
await b.close();
