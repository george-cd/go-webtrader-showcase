# How the demo video is made

All scenes are filmed from the running platform (demo server with `DEMO=1`), as JPEG frames with the time of each frame.

| Script | What it films |
|---|---|
| `film.mjs` … `film5.mjs` | The trader, the dealing desk, the broker's business, money managers, statements |
| `trade.mjs` | Makes a money manager with a short, real trading history (demo prices) for the next scenes |
| `film6.mjs` | "What if I had joined?", the manager's monthly report, the statement in plain words |
| `film7.mjs` | The phone app (the iPhone/Android build, served by `appwebtrader/scripts/preview.mjs`) |
| `film8.mjs`, `film8b.mjs` | Our own ideas, part 2: profit lock, shadow account, contests, invite a friend, tax report, sentiment, leverage level, the desk's Client programs |
| `cards.mjs` | The title cards |
| `encode.py` | One mp4 per scene, then joins them without encoding again |
| `lp.mjs` | Turns the demo liquidity provider's prices on or off |

The pitch video for investors is made by the scripts in `../pitch`. All screens show demo data.
