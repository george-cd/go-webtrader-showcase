// trade.mjs: makes a manager with a real, profitable history for the video (no browser: it waits for prices)
import { writeFileSync } from 'fs';
const B = 'http://localhost:8097', sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const call = async (m, p, b, t, acc) => { const r = await fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}), ...(acc ? { 'X-Account': String(acc) } : {}) }, body: b ? JSON.stringify(b) : undefined }); const x = await r.text(); if (!r.ok) throw new Error(p + ' ' + r.status + ' ' + x); return x ? JSON.parse(x) : {}; };
const admin = (await call('POST', '/api/auth/login', { email: 'dealer@broker.example', password: 'dealer-pass-123' })).token;
const email = `sofia.manager.${Date.now()}@demo.example`;
const reg = await call('POST', '/api/auth/register', { email, password: 'password-123' });
const acc = await call('GET', '/api/account', null, reg.token);
await call('POST', '/api/wallet/deposits', { amount: '1500', reference: 'mgr' + Date.now() }, reg.token, acc.number);
// a professional client in the "managers" group: no commission and 1:500 on EURUSD, as brokers offer to money managers
await call('PUT', `/api/admin/accounts/${acc.number}/category`, { category: 'professional' }, admin).catch((e) => console.log('category', e.message));
await call('PATCH', `/api/admin/accounts/${acc.number}`, { group: 'managers' }, admin);
await call('PUT', '/api/admin/group-symbols', { group: 'managers', symbol: 'EURUSD', leverage: 500, commission_per_lot: '0' }, admin).catch(async (e) => {
  console.log('retry with a number', e.message); await call('PUT', '/api/admin/group-symbols', { group: 'managers', symbol: 'EURUSD', leverage: 500, commission_per_lot: 0 }, admin); });
const m = await call('PUT', '/api/account/mam', { name: 'Aegean Growth Fund', perf_fee: 20, mgmt_fee: 2, open: true, public: true }, reg.token, acc.number);
// The demo's own prices move at random and very little. The liquidity provider's demo price for EURUSD sits a few pips
// above them, so switching between the two gives a known move: four trades in profit and one at a loss.
const lp = async (on) => { const cur = await call('GET', '/api/admin/lp', null, admin); await call('PUT', '/api/admin/lp', { ...cur.settings, enabled: on, password: 'demo' }, admin); await sleep(4000); };
const retry = async (fn) => { for (let i = 0; i < 10; i++) { try { return await fn(); } catch (e) { await sleep(1500); } } throw new Error('gave up'); };
for (const side of ['sell', 'sell', 'buy', 'sell', 'sell']) {
  await lp(true);
  const o = await retry(() => call('POST', '/api/orders', { symbol: 'EURUSD', side, lots: 1 }, reg.token, acc.number));
  await sleep(3000);
  await lp(false);
  await retry(() => call('POST', '/api/positions/' + o.position.id + '/close', {}, reg.token, acc.number));
  const a = await call('GET', '/api/account', null, reg.token, acc.number);
  console.log(side, 'balance', a.balance);
  await sleep(2000);
}
writeFileSync('/tmp/video/manager.json', JSON.stringify({ email, number: acc.number, code: m.mam.code }));
console.log('done', email);
