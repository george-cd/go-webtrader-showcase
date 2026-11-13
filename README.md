# Go WebTrader

**A web trading platform for brokers, with an AI assistant that runs on the broker's own servers.**

Clients trade in the browser, with no installation. They can type what they want in plain words and see the risk in money before every order. Dealers get a desk that finds toxic flow on its own, routes every position to the A-book or the B-book with the reason in plain words, hedges the broker's exposure automatically and shows where the stop-outs sit.

**Built with Go, in two front-end versions:** one in plain JavaScript and one in React. Both look and behave the same.

**▶ [Open the showcase page](https://george-cd.github.io/go-webtrader-showcase/)**, with the 1½-minute demo video.

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

The same screen in two versions on a Go back end: one in plain JavaScript and one in React. They look and behave the same, so a broker can choose the one that fits its team.

## The AI assistant

- **Orders in plain words.** *"buy 0.1 eurusd sl 20 tp 40"*, *"close half of my gold"*, *"trailing 15 on my sells"*. It understands English and Greek, and more languages can be added. The assistant shows exactly what will happen, with pips already turned into prices, and **nothing runs until the client clicks Confirm**.
- **Strategies without code, instead of Expert Advisors.** *"when RSI 14 on EURUSD M15 falls below 30 and the price is above the EMA 200, buy 0.1 with a 20 pip stop"*. The client tests the strategy on recent history (number of trades, profit, win rate, worst drop) before activating it. Once active, the AI takes no part in trading.
- **Risk questions.** *"what if gold falls 2%?"*, *"what is my risk?"*. The answer includes the stop losses that would close positions on the way.
- **Your servers.** The assistant runs on the broker's own hardware, so client data never leaves the broker.

## For the dealing department

![Dealing desk](assets/dealing-desk.jpg)

A dealing desk built to do what MT4/MT5 Manager leaves to the dealer by hand.

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
- **Automatic backups**, monitoring for **Prometheus/Grafana**, and a **load test**: about **1,650 orders and closes per second** on one test server, every order written to disk.
- **Migration from MT4/MT5**: clients, open positions and history, with the same login numbers.
- A **signed license** per broker and domain; installation guide, back office manual and API reference in **Word and PDF**.

## Built for real money

- **Nothing is lost:** after a restart or a power cut the platform comes back exactly as it was.
- **Fast:** opening and closing a position takes well under a millisecond.
- **No double trades:** a retried click or a reconnect never opens a second position.
- **Exact money:** no rounding errors in balances.
- **Reporting** for back office, CRM and reports, without slowing trading down.
- **Installed on the broker's own servers.**

---

*A live demo is available on request.*
