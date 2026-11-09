# Go WebTrader

**A web trading platform for brokers, with an AI assistant that runs on the broker's own servers.**

Clients trade in the browser, with no installation. They can type what they want in plain words and see the risk in money before every order. Dealers get a desk that finds toxic flow on its own, routes every position to the A-book or the B-book with the reason in plain words, hedges the broker's exposure automatically and shows where the stop-outs sit.

**Built with Go, in two front-end versions:** one in plain JavaScript and one in React. Both look and behave the same.

This repository is a showcase. The source code is private.

---

## For traders

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

- **1, 2 or 4 charts on screen**, each with its own symbol and timeframe (M1 to D1); candles or line; save as a picture.
- **Indicators:** SMA, EMA, Bollinger, RSI, MACD, Stochastic, ATR and tick volume, each lower one in its own pane.
- **Drawing tools:** trend line, horizontal line, Fibonacci retracement, rectangle, eraser. Drawings stay in place on every timeframe.
- **A countdown to the candle close** next to the live price, and lines for entries, stop losses, take profits, pending orders and alerts.

## Two versions: JavaScript and React

The same screen in two versions on a Go back end: one in plain JavaScript and one in React. They look and behave the same, so a broker can choose the one that fits its team.

## The AI assistant

- **Orders in plain words.** *"buy 0.1 eurusd sl 20 tp 40"*, *"close half of my gold"*, *"trailing 15 on my sells"*. It understands English and Greek, and more languages can be added. The assistant shows exactly what will happen, with pips already turned into prices, and **nothing runs until the client clicks Confirm**.
- **Strategies without code, instead of Expert Advisors.** *"when RSI 14 on EURUSD M15 falls below 30 and the price is above the EMA 200, buy 0.1 with a 20 pip stop"*. The client tests the strategy on recent history (number of trades, profit, win rate, worst drop) before activating it. Once active, the AI takes no part in trading.
- **Risk questions.** *"what if gold falls 2%?"*, *"what is my risk?"*. The answer includes the stop losses that would close positions on the way.
- **Your servers.** The assistant runs on the broker's own hardware, so client data never leaves the broker.

## For the dealing department

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

In the demo, a simulated arbitrage client is marked toxic within minutes, with the reasons.

## Built for real money

- **Nothing is lost:** after a restart or a power cut the platform comes back exactly as it was.
- **Fast:** opening and closing a position takes well under a millisecond.
- **No double trades:** a retried click or a reconnect never opens a second position.
- **Exact money:** no rounding errors in balances.
- **Reporting** for back office, CRM and reports, without slowing trading down.
- **Installed on the broker's own servers.**

---

*A live demo is available on request.*
