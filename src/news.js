const Parser = require('rss-parser');
const parser = new Parser({ timeout: 8000 });

const MAX_ARTICLES = 5;

/**
 * Fetch news articles for a ticker from Yahoo Finance RSS.
 * Falls back to Google Finance RSS if Yahoo fails.
 */
async function getNews(ticker) {
  const feeds = [
    `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${ticker}&region=US&lang=en-US`,
    `https://news.google.com/rss/search?q=${ticker}+ETF+fund&hl=en-US&gl=US&ceid=US:en`,
  ];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      if (feed.items && feed.items.length > 0) {
        return feed.items.slice(0, MAX_ARTICLES).map(item => ({
          title: item.title?.trim() || 'No title',
          link: item.link || item.guid || '#',
          pubDate: item.pubDate ? new Date(item.pubDate) : null,
          source: item.creator || extractSource(item.title, url),
        }));
      }
    } catch (_) {
      // try next feed
    }
  }

  return []; // no articles found
}

function extractSource(title, url) {
  if (url.includes('google.com')) return 'Google News';
  if (url.includes('yahoo.com')) return 'Yahoo Finance';
  return 'News';
}

module.exports = { getNews };
