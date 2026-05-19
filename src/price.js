const fetch = require("node-fetch");

const BASE = "https://finnhub.io/api/v1";

async function getPrice(ticker) {
  const key = process.env.FINNHUB_KEY;
  if (!key) throw new Error("Missing FINNHUB_KEY in .env");

  // Fetch quote (price/change) and profile (name) in parallel
  const [quoteRes, profileRes] = await Promise.all([
    fetch(`${BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${key}`),
    fetch(
      `${BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${key}`,
    ),
  ]);

  const quote = await quoteRes.json();
  const profile = await profileRes.json();

  // Finnhub returns { c: 0, d: 0, ... } with all zeros for invalid tickers
  if (!quote.c || quote.c === 0) {
    throw new Error(`No data found for "${ticker}"`);
  }

  const change = quote.d ?? 0; // change
  const changePct = quote.dp ?? 0; // change percent

  return {
    name: profile.name || ticker,
    price: quote.c, // current price
    change,
    changePct,
    isUp: change >= 0,
    open: quote.o, // open
    previousClose: quote.pc,
    dayHigh: quote.h,
    dayLow: quote.l,
    volume: null, // Finnhub free tier doesn't include volume in /quote
    avgVolume: null,
    marketCap: profile.marketCapitalization
      ? profile.marketCapitalization * 1_000_000
      : null,
    low52: quote["52WeekLow"] ?? null,
    high52: quote["52WeekHigh"] ?? null,
    ytdChangePct: null,
    currency: profile.currency || "USD",
    exchange: profile.exchange || "",
    marketState: "REGULAR", // Finnhub free doesn't expose market state
  };
}

module.exports = { getPrice };
