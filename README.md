# Go WebTrader

**A web trading platform for brokers, with an AI assistant that runs on the broker's own servers.**

Clients trade in the browser, with no installation. They can type what they want in plain words and see the risk in money before every order. Dealers get a desk that finds toxic flow on its own, routes every position to the A-book or the B-book with the reason in plain words, hedges the broker's exposure automatically and shows where the stop-outs sit.

**A C++ core with Go services around it, in two front-end versions:** one in plain JavaScript and one in React. Both look and behave the same. 10,000 users online, 1,000,000 open positions: [measured](#under-the-hood-a-c-core-go-around-it).

**▶ [Open the showcase page](https://george-cd.github.io/go-webtrader-showcase/)**, with the full demo video (about 6 minutes).

**▶ [The 3-minute pitch for investors](assets/go-webtrader-pitch.mp4)**: the market, the problem, and what is already built — for people who don't come from trading.

![Go WebTrader in action](assets/preview.gif)

This repository is a showcase. The source code is private.

---

## For traders

![Trading screen](assets/trader.jpg)

- **One screen, nothing hidden.** Market watch with live prices, spread, daily change and a mini trend line, the charts, the order ticket, and the positions in tabs. Panels can be resized; dark and light theme.
- **Risk in money, before the order.** Stop loss and take profit are entered in pips. Before the client clicks Buy, the ticket shows:
  - the margin needed and the value of one pip;
  - the loss at the stop loss in dollars and as a % of equity;
  - a warning when there is no stop loss.
- **Everything MT4/MT5 traders expect.** Market and pending orders (limit, stop, expiry), stop loss, take profit, trailing stop, partial close, hedging and netting accounts, swap, commission, margin call and stop-out.
- **One-click trading switch**: off, every quick order asks first; on, it trades at once. Plus *Close profitable* and *Close all*.
- **Depth of market ladder**: click a price to place a limit or stop order at it.
- **Price alerts** from a tab or by clicking a price on the chart. They keep working when the trader is away, and a **notification arrives on the phone or computer even when the platform is closed**.
- **Works on desktops, tablets and phones.**

## Charts

![Four charts, light theme](assets/four-charts-light.jpg)

- **1, 2 or 4 charts on screen**, each with its own symbol and timeframe (M1 to D1); candles or line; save as a picture.
- **Indicators:** SMA, EMA, Bollinger, RSI, MACD, Stochastic, ATR and tick volume, each lower one in its own pane.
- **Drawing tools:** trend line, horizontal line, Fibonacci retracement, rectangle, eraser. Drawings stay in place on every timeframe.
- **A countdown to the candle close** next to the live price, and lines for entries, stop losses, take profits, pending orders and alerts.

## One login, every account

![The account switcher](assets/accounts.jpg)

- **One sign-in for all of a client's accounts**, live and demo, instead of a password per account as in MT4/MT5.
- **Every account in its own currency**: USD, EUR, GBP, JPY, CHF, AUD, CAD, USDT, Bitcoin or Ether, converted at the live market rate. Money moves between the client's own accounts in one click.
- **Sharing with levels**: view only, close only or trade, taken back at any time.
- **Security**: two-factor sign-in, passkeys (fingerprint or face), the list of devices signed in, and sign-in from the broker's CRM.

## Beyond MT4/MT5

![A plan for every trade](assets/trade-plan.jpg)

- **Size from the risk**: "0.5% of my equity" with a stop loss becomes the right number of lots.
- **Trade plan**: targets that each close a part of the position, and the stop moves to the entry after the first one.
- **Guaranteed stop loss**: closes at exactly the stop, even on a gap. The premium is shown before the order and paid only if the stop is hit.
- **OCO orders**: a buy above and a sell below the market; the first to fill cancels the other.
- **Execution report**: for every position, the price seen, the fill and the slippage, and a maximum slippage per order.
- **A smarter stop-out**: only the part needed is closed, not whole positions.

### "Why did my position close?"

![Why the position closed](assets/why-closed.jpg)

What closed it, the level, the price at that moment, a gap explained in pips, and the 1-minute chart around the close.

### Stats that say what to change

![The Stats tab](assets/stats.jpg)

Win rate, profit factor, return from trading only, drawdown, by symbol, hour, day and side, and the conclusion in plain words.

### Guards against a bad day

![Account guards](assets/guards.jpg)

Daily loss limit, maximum loss, maximum size open and a pause after a run of losses. The broker sets them per group of accounts; the client can only make them stricter.

### Copy trading, built in

![Copy trading](assets/copy-trading.jpg)

One account copies another on the platform itself. A list of strategies shows results in percent only, and a performance fee is paid only on new profit.

### Every account in one view

![The portfolio](assets/portfolio.jpg)

All accounts together in one currency, with the net exposure per symbol.

### AI agents, on a leash

![AI agents](assets/ai-agents.jpg)

Clients connect Claude, ChatGPT or any AI agent to one account through MCP, within a mandate they write: symbols, size, daily loss, orders a day, approval on the phone for bigger orders, a kill switch and an audit log. The broker can cap or turn off agents per group.

### The real cost, and the worst case

![Real cost and stress test](assets/stress-test.jpg)

Spread, commission, swap and break-even before the click, and what ±1%, ±3% or a weekend gap would do to the whole account.

### A history nobody can rewrite

![Proof of history](assets/proof.jpg)

Every trade and deposit is chained with SHA-256 and signed by the server; the client checks the full statement against the receipts kept in the browser.

### Orders that watch other markets, and the clock

![A conditional order with a time stop](assets/conditional.jpg)

"Buy EURUSD when gold goes above 2370", time stops, a weekly closing schedule, a drawdown pledge for copy trading, and notifications with buttons.

## Two versions: JavaScript and React

![The React version](assets/react-trader.jpg)

The same screen in two versions, on a C++ core with Go services: one in plain JavaScript and one in React. They look and behave the same, so a broker can choose the one that fits its team.

## The AI assistant

- **Orders in plain words.** *"buy 0.1 eurusd sl 20 tp 40"*, *"close half of my gold"*, *"trailing 15 on my sells"*. It understands English and Greek, and more languages can be added. The assistant shows exactly what will happen, with pips already turned into prices, and **nothing runs until the client clicks Confirm**.
- **Strategies without code, instead of Expert Advisors.** *"when RSI 14 on EURUSD M15 falls below 30 and the price is above the EMA 200, buy 0.1 with a 20 pip stop"*. The client tests the strategy on recent history (number of trades, profit, win rate, worst drop) before activating it. Once active, the AI takes no part in trading.
- **Risk questions.** *"what if gold falls 2%?"*, *"what is my risk?"*. The answer includes the stop losses that would close positions on the way.
- **Your servers.** The assistant runs on the broker's own hardware, so client data never leaves the broker.

## For the dealing department

![Dealing desk](assets/dealing-desk.jpg)

A dealing desk built to do what MT4/MT5 Manager leaves to the dealer by hand.

- **Needs you:** the desk lists what to handle now (approvals, withdrawals, stop-outs, bad prices, news, the LP, backups), each with an **Open** button to the right screen.
- **Sounds:** a short tune for each kind of event, only for something new. Each dealer turns them on or off, sets the volume and chooses the events.
- **Kinds of traders:** 19 behaviours per client (latency arbitrage, news trader, coordinated group, scalper, martingale, careful ...), each with the reason; accounts of different people that trade together; trades opened around high-impact news.
- **Automations without code:** "when a client gets a behaviour / loses N today / is stopped out / opens a big trade ... then the A-book, a message, a group, a pause or a word to the dealers", once a day per client.
- **Routing report:** what the A/B decisions were worth per book and per rule, the shadow rules' result, and how each LP filled (refusals, split orders, slippage in pips).
- **Several LPs:** best bid and ask across them, each order to the best price, big orders split into parts.
- **Easy to find your way:** 26 screens in five groups, and two lines of help on every screen. A short welcome the first time.

### Money managers (MAM) and more

- **Money managers:** a manager trades one account and every trade is split live to the investors who joined with the invite link (by equity, balance or fixed lots), with a performance fee and a yearly management fee. Each investor can set their own limit and leave the manager on their own.
- **"What if I had joined?"** Before joining, the client sees what their own amount would have become over the last months, after fees, with the worst fall — and whether their own loss limit would have taken them out.
- **Monthly reports from the manager:** the platform fills in the month's numbers, the manager adds a note, every investor gets it with a notice.
- **A public track record** anyone can open: results in percent, from the journal nobody can rewrite.
- **Cost saver:** Close By without the spread, and a warning when a hedge pays swap twice. **Stop Limit** orders as in MT5.
- **Statements** (day or month, PDF or CSV), **credit (bonus)**, **swap-free (Islamic) accounts**, and **trading breaks** with a reality check. Every statement also **explains itself in plain words**: what happened, what it cost, what to watch.
- **Our own ideas, part 2:** a **profit lock** (a share of every good month kept apart, never traded), a **shadow account** (the client's trades replayed with their own rules), **earn your leverage** (new clients start lower and earn the rest), a **pause before a deposit** right after a big loss, a **daily summary** on the phone, the **monthly statement by email**, a **tax report**, **client sentiment** in the order ticket and **voice orders**.
- **To bring clients:** **demo contests** with a live table and **invite a friend** with cash or credit rewards, set in the desk's **Client programs**; **shares** of seven big US companies.
- **The broker's own phone app** for iPhone and Android, built from the same screens: everything above works in the app, with notices on the phone.

![Money manager](assets/mam-manager.jpg)
![Public track record](assets/track-record.jpg)
![What if I had joined](assets/what-if.jpg)
![The phone app](assets/phone-app.jpg)
![Profit lock](assets/profit-lock.jpg)
![Shadow account](assets/shadow-account.jpg)
![Contests](assets/contests.jpg)
![Client programs](assets/desk-programs.jpg)
![Kinds of traders](assets/desk-behaviour.jpg)
![Behaviours next to each client](assets/desk-behaviour-chips.jpg)
![Automations](assets/desk-automations.jpg)
![Routing report](assets/desk-routing.jpg)
![Several LPs](assets/desk-several-lps.jpg)
![Cost saver](assets/cost-saver.jpg)

![Needs you and the sound settings](assets/desk-needs-sounds.jpg)

- **Toxic flow found automatically.** Every client gets a score from 0 to 100, and "Why?" explains it in plain words.
- **A-book / B-book routing by rules,** with the reason shown for every position ("Toxic flow to the market", "Gold over 2 lots"). Per-client overrides. A **shadow book** tests new rules on the same positions before they go live.
- **Automatic hedging** of the broker's exposure, and a **news mode** for volatile moments.
- **Price guard** against bad prices.
- **Liquidation map:** for every price in a range, which stop losses close, which accounts reach stop-out and what the broker makes or loses.
- **Time machine:** see the platform as it was at any past moment, for client complaints or the regulator.
- **Ask the desk,** in English or Greek: *"clients long gold over 5 lots"*, *"what if bitcoin falls 3%"*.
- **Reports:** where the broker's money came from (commission, swap, B-book, hedges) and how clients really do.
- **Four-eyes approvals and an audit trail** for every rule, limit or override change, with who, when and why.
- **Alerts for dealers,** in the page and on the phone: new toxic client, auto-hedge, stop-out, bad prices.
- **Back office:** withdrawals with four-eyes approval and one-click reconciliation of balances.

![A client flagged as toxic](assets/desk-toxic-flow.jpg)

In the demo, a simulated arbitrage client is marked toxic within minutes, with the reasons.

![Liquidation map](assets/desk-liquidation-map.jpg)

### Loss limits, watched by the desk

![Account guards on the dealing desk](assets/desk-guards.jpg)

The accounts that hit a limit first, then the closest to one; rules per group of accounts; a reset after review.

### Every AI agent, under the desk's eye

![AI agents on the dealing desk](assets/desk-agents.jpg)

Every agent on a client account, its mandate, its day and every request, with one switch to turn them all off.

## For the broker's business

### A real liquidity provider, over FIX

![LP connection](assets/desk-lp.jpg)

- Connects to **cTrader liquidity** (Pepperstone, IC Markets and other cTrader brokers) over **FIX 4.4**, with its own FIX engine.
- The LP's prices replace the simulated ones; the symbol list is read from the LP and matched by name.
- **A-book trades and B-book hedges are executed at the LP**, each with the LP's price and the slippage shown.
- If the LP goes quiet, prices stop: they are never replaced by made-up ones.

### Partners (IB)

![Partners](assets/desk-partners.jpg)

- A sign-up link for every partner; the clients who sign up with it are theirs.
- **Rebate per lot per asset class**, two levels (the partner and the partner above it), paid automatically when a live trade closes.
- The partner sees the link, the clients and the earnings inside the platform.

![The partner's own view](assets/partner.jpg)

### Prop firm

![A trader in a challenge](assets/prop-trader.jpg)

- Funded-trader programs with phases: **Challenge → Verification → Funded** with a profit split.
- Daily and maximum loss **checked on every price**; a broken rule fails the challenge at once, a reached target passes the phase on its own.
- The trader sees the progress above the positions; the desk sees every challenge live.

![Prop programs and challenges on the desk](assets/desk-prop.jpg)

### Clients worth a call today

![Growth](assets/desk-growth.jpg)

- **Ready for a live account**: demo clients who trade regularly and carefully and have not funded an account yet.
- **May be leaving**: clients who stopped coming, trade much less, withdrew most of their money or were stopped out, with what to do for each.
- Both lists go to the CRM as a file; a **morning report** in plain words reaches the dealers' phones every day.

![Morning report](assets/desk-morning.jpg)

### A coach, a replay, and a deposit button

![The coach](assets/coach.jpg)

- **The coach**: before an order that looks like a known mistake (revenge trading, overtrading, no stop loss, too much risk), a short word in plain language. It never blocks.
- **Trade replay**: every closed trade plays back on the chart, with the entry, stop loss, take profit and close.
- **Add funds**: when the margin falls, one tap opens the broker's payment page (e.g. the PSP Hub) with the amount that brings the account back.

![Trade replay](assets/replay.jpg)

### Your brand, their language

![White-label, in Greek](assets/white-label-greek.jpg)

- The broker's **name, logo and colours**, set from the back office.
- **English, Greek, Spanish and Arabic** (right to left); a new language is one table to translate.

![Arabic, right to left](assets/arabic-rtl.jpg)

### News, before it hits

![Economic calendar](assets/desk-calendar.jpg)

- An **economic calendar** inside the platform, entered by the broker or imported from a file.
- Traders can have positions **closed minutes before high-impact news** on their currencies.
- The desk switches its **news mode on by itself** around high-impact announcements.

### The regulator's rules

![Regulation](assets/desk-regulation.jpg)

- **Retail leverage limits** per asset class (ESMA preset in one click), **negative balance protection**, professional clients.
- The **risk warning** on every page with the real share of losing accounts, and the **transaction report** for regulatory reporting.
- **Symbols, market hours, holidays and dividends** managed from the back office; closed markets refuse new orders.

![Symbols](assets/desk-symbols.jpg)

### Ready for the IT team

![System](assets/desk-system.jpg)

- A **standby server** copies every change live and can take over in about a minute.
- **Automatic backups**, monitoring for **Prometheus/Grafana**, and a **load test with 10,000 real users online** (see below).
- **Migration from MT4/MT5**: clients, open positions and history, with the same login numbers.
- A **signed license** per broker and domain; installation guide, back office manual and API reference in **Word and PDF**.

## Under the hood: a C++ core, Go around it

Every calculation that touches money runs in one core written in **C++**, built for speed and for exact, repeatable results. Everything around it, from the API to the dealing desk and the AI, is written in **Go**.

**The core (C++)**: all the trading calculations, live on every price:

- Equity, margin and margin level of every account on every price, in any account currency.
- Hedged margin, volume tiers, dynamic leverage, ESMA retail limits; settings per broker, per group and per login.
- Margin calls with advice, and a smart stop-out that closes only what is needed.
- Stop loss, take profit, trailing and guaranteed stops; limit, stop, stop-limit, OCO, conditional orders and time stops.
- Trade plans, account guards, prop-firm rules, copy trading and money managers.
- Swaps, commissions, dividends, credit and currency conversion.
- *"What if prices moved?"* for the whole book, in one call.
- Every change on disk before the answer; after a restart it comes back exactly the same, byte for byte.
- A history nobody can rewrite: every account's events are chained with SHA-256.
- All its memory is set aside at the start: nothing is allocated while trading, so there are no sudden pauses as the broker grows.

**Around it (Go, and a C++ gateway)**: the services a broker and its clients use:

- The client API and sign-in, with sessions, devices and per-address limits; passwords hashed slowly, at low priority, so sign-ins never slow trading down.
- A **C++ WebSocket gateway**: one connection per browser carries the live prices and the client's own account; the core sends each account only what changed.
- The back office and the dealing desk; liquidity over FIX 4.4; the AI assistant on the broker's own servers; price alerts and phone notifications.
- A standby server, backups, a reporting copy in PostgreSQL, Prometheus monitoring, the license.

**Measured** on one small test server with 2 virtual CPUs, the test tools included:

| | |
|---|---|
| Open positions in the core | **1,000,000** (20,000 logins, 50 each) |
| Checking a price against all of them | **0.3 µs** median, about 1 µs for 99% |
| Prices through the core | **~270,000 a second** |
| 1,000,000 market orders | **6.4 s** (about 5 µs each inside the core) |
| Users online at once, all trading | **10,000**, with live prices and a live account each |
| From an order to the new position on screen | **2 ms** median; no errors, no dropped connections |

## Built for real money

- **Nothing is lost:** after a restart or a power cut the platform comes back exactly as it was.
- **Fast:** an order is checked in about 5 microseconds inside the core, and reaches the client's screen in about 2 milliseconds with 10,000 users online.
- **No double trades:** a retried click or a reconnect never opens a second position.
- **Exact money:** no rounding errors in balances.
- **Reporting** for back office, CRM and reports, without slowing trading down.
- **Installed on the broker's own servers.**

---

*A live demo is available on request.*
