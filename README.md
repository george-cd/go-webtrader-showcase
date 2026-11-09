# Go WebTrader

**A web trading platform for brokers, with an AI assistant that runs on the broker's own servers.**

Clients trade in the browser, with no installation. They can type what they want in plain words and see the risk in money before every order. Dealers get a desk that finds toxic flow on its own, routes every position to the A-book or the B-book with the reason in plain words, hedges the broker's exposure automatically and shows where the stop-outs sit.

![Go WebTrader in action](assets/preview.gif)

▶ **[Watch the demo (1 minute)](assets/go-webtrader-demo.mp4)**: the JavaScript version, the React version, then the dealing desk.

**Two front-ends, one platform.** The trader screen exists in two versions on the same Go engine: plain JavaScript with no framework, and React. Both share one design, one chart engine and the same trading logic.

This repository is a showcase. The source code is private.

---

## For traders

![Trading screen](assets/trader.jpg)

- **One screen, nothing hidden.** Market watch with live prices, spread, daily change and a mini trend line, the charts, the order ticket, and the positions in tabs. Panels can be resized; dark and light theme.
<img src="assets/order-ticket.jpg" alt="Order ticket with the risk in money" width="300" align="right">

- **Risk in money, before the order.** Stop loss and take profit are entered in pips. Before the client clicks Buy, the ticket shows:
  - the margin needed and the value of one pip;
  - the loss at the stop loss in dollars and as a % of equity;
  - a warning when there is no stop loss.
- **Everything MT4/MT5 traders expect.** Market and pending orders (limit, stop, expiry), stop loss, take profit, trailing stop, partial close, hedging and netting accounts, swap, commission, margin call and stop-out.
- **One-click trading switch**: off, every quick order asks first; on, it trades at once. Plus *Close profitable* and *Close all*.
- **Depth of market ladder**: click a price to place a limit or stop order at it.
- **Price alerts** from a tab or by clicking a price on the chart. The server watches them, so they keep working when the trader is away, and a **notification arrives on the phone or computer even when the platform is closed**.
- **Works on desktops, tablets and phones.**

## Charts

![Four charts, light theme](assets/four-charts-light.jpg)

- **1, 2 or 4 charts on screen**, each with its own symbol and timeframe (M1 to D1); candles or line; save as a picture.
- **Indicators:** SMA, EMA, Bollinger, RSI, MACD, Stochastic, ATR and tick volume, each lower one in its own pane.
- **Drawing tools:** trend line, horizontal line, Fibonacci retracement, rectangle, eraser. Drawings stay in place on every timeframe.
- **A countdown to the candle close** next to the live price, and lines for entries, stop losses, take profits, pending orders and alerts.

![Depth of market and pending orders](assets/depth-and-orders.jpg)

## Two versions: JavaScript and React

![React version](assets/react-trader.jpg)

The same screen, built twice on the same Go server: once in plain JavaScript (no framework, no build step) and once with React components. They share the styles, the chart engine and the trading logic, so they look and behave the same.

## The AI assistant

- **Orders in plain words.** *"buy 0.1 eurusd sl 20 tp 40"*, *"close half of my gold"*, *"trailing 15 on my sells"*. It understands English and Greek, and more languages can be added. The assistant shows exactly what will happen, with pips already turned into prices, and **nothing runs until the client clicks Confirm**.
- **Strategies without code, instead of Expert Advisors.** *"when RSI 14 on EURUSD M15 falls below 30 and the price is above the EMA 200, buy 0.1 with a 20 pip stop"*. The client tests the strategy on recent history (number of trades, profit, win rate, worst drop) before activating it. Once active, plain code checks it at every candle close, and the AI takes no part in trading.
- **Risk questions.** *"what if gold falls 2%?"*, *"what is my risk?"*. The platform computes every number with the same formulas as the trading engine, including the stop losses that would close positions on the way. The AI only reads the question.
- **Your model, your servers.** The assistant uses an open-source model on the broker's own hardware (Ollama, llama.cpp or vLLM). Client data never leaves the broker. Common commands are understood instantly by built-in rules, so they work even when the model is offline.

![Strategies, backtest and risk](assets/strategies-and-risk.jpg)

## For the dealing department

A dealing desk built to do what MT4/MT5 Manager leaves to the dealer by hand.

![Dealing desk](assets/dealing-desk.jpg)

- **Toxic flow found automatically.** Every client gets a score from 0 to 100 from how the price moves 1, 5 and 60 seconds after each trade, win rate, holding time and profit factor. "Why?" explains every point in plain words.
- **A-book / B-book routing by rules,** with the reason shown for every position ("Toxic flow to the market", "Gold over 2 lots"). Per-client overrides. A **shadow book** tests new rules on the same positions before they go live.
- **Automatic hedging:** the net exposure over a limit per symbol is hedged at the liquidity provider. **News mode** halves the limits for a set time.
- **Price guard:** stale, spiking or very wide prices block market orders.
- **Liquidation map:** for every price in a range, which stop losses close, which accounts reach stop-out and what the broker makes or loses.
- **Time machine:** rebuild the whole platform as it was at any past moment, for client complaints or the regulator.
- **Ask the desk,** in English or Greek: *"clients long gold over 5 lots"*, *"what if bitcoin falls 3%"*.
- **Reports:** where the broker's money came from (commission, swap, B-book, hedges) and how clients really do.
- **Four-eyes approvals and an audit trail** for every rule, limit or override change, with who, when and why.
- **Alerts for dealers,** in the page and on the phone: new toxic client, auto-hedge, stop-out, bad prices.
- **Back office:** withdrawals with four-eyes approval, an append-only ledger, one-click reconciliation.

![A latency-arbitrage client flagged as toxic](assets/desk-toxic-flow.jpg)

The demo includes a client that sees bitcoin prices 5 seconds early. Within minutes the desk marks it toxic and explains why.

![Liquidation map](assets/desk-liquidation-map.jpg)

The liquidity provider is simulated with the platform's own prices; a real one plugs in through the price feed.

## Built for real money

- **Nothing is lost.** Every change is written to disk before it is confirmed, and after a restart or a power cut the platform comes back exactly as it was.
- **Fast.** Opening and closing a position takes microseconds in memory, and well under a millisecond including the safe write to disk.
- **No double trades:** a retried click or a reconnect never opens a second position.
- **Money is counted in whole cents,** never in floating point.
- **PostgreSQL reporting copy** for back office, CRM and reports, filled in the background so trading never waits for it.
- **Installed on the broker's own servers:** a single program that needs no outside services.

## Phone

<img src="assets/phone.jpg" alt="Go WebTrader on a phone" width="320">

---

*Prices in the demo come from a built-in simulator, and the other clients are simulated accounts trading on their own.*
