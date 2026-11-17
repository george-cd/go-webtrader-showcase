const B = 'http://localhost:8097', on = process.argv[2] === 'on';
const t = (await (await fetch(B + '/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'dealer@broker.example', password: 'dealer-pass-123' }) })).json()).token;
const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t };
const cur = await (await fetch(B + '/api/admin/lp', { headers: h })).json();
const r = await fetch(B + '/api/admin/lp', { method: 'PUT', headers: h, body: JSON.stringify({ ...cur.settings, enabled: on, password: 'demo' }) });
console.log('LP prices', on ? 'on' : 'off', r.status);
const q = async () => (await (await fetch(B + '/api/account', { headers: h })).json(), (await (await fetch(B + '/api/symbols', { headers: h })).json()));
