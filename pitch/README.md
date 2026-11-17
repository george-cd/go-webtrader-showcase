# Investor pitch video (2:56)

`assets/go-webtrader-pitch.mp4` — a short video for investors who don't come from trading:
the market, the problem (one supplier, MetaQuotes), the answer, twelve real screens (incl. "what if I had joined" and the phone app), the difference,
where the product stands, how it makes money, and the ask.

How it is made (no voice, soft music generated in code):
- `cards.mjs` draws the title cards and the frames around the screen recordings (Playwright).
- `build.py` turns each part into an mp4 and joins them; the screen recordings come from the main demo video's scenes.

Market numbers and their sources are printed on the cards (Finance Magnates Intelligence, CySEC).
The revenue line is an example, not a forecast. All screens show demo data.
