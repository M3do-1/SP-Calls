const { EmbedBuilder } = require('discord.js');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(num, decimals = 2) {
  if (num == null) return 'N/A';
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtVolume(n) {
  if (n == null) return 'N/A';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtMarketCap(n) {
  if (n == null) return 'N/A';
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function changeStr(change, changePct) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${fmt(change)} (${sign}${fmt(changePct)}%)`;
}

function marketStateLabel(state) {
  switch (state) {
    case 'PRE': return '🌅 Pre-Market';
    case 'POST': return '🌆 After-Hours';
    case 'CLOSED': return '🔒 Market Closed';
    default: return '🟢 Market Open';
  }
}

function priceColor(isUp) {
  return isUp ? 0x2ecc71 : 0xe74c3c; // green / red
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Price Embed ───────────────────────────────────────────────────────────────

function buildPriceEmbed(ticker, data) {
  const arrow = data.isUp ? '▲' : '▼';
  const sign = data.isUp ? '+' : '';

  const embed = new EmbedBuilder()
    .setColor(priceColor(data.isUp))
    .setTitle(`${arrow} ${ticker} — ${data.name}`)
    .setDescription(
      `**$${fmt(data.price)}**  ${arrow} ${sign}${fmt(data.change)} (${sign}${fmt(data.changePct)}%)\n` +
      `${marketStateLabel(data.marketState)} · ${data.exchange}`
    )
    .addFields(
      { name: 'Open', value: `$${fmt(data.open)}`, inline: true },
      { name: 'Prev Close', value: `$${fmt(data.previousClose)}`, inline: true },
      { name: 'Day Range', value: `$${fmt(data.dayLow)} – $${fmt(data.dayHigh)}`, inline: true },
      { name: '52W Range', value: `$${fmt(data.low52)} – $${fmt(data.high52)}`, inline: true },
      { name: 'Volume', value: fmtVolume(data.volume), inline: true },
      { name: 'Avg Volume', value: fmtVolume(data.avgVolume), inline: true },
    )
    .setFooter({ text: `Yahoo Finance · ${ticker}` })
    .setTimestamp();

  if (data.marketCap) {
    embed.addFields({ name: 'Market Cap / AUM', value: fmtMarketCap(data.marketCap), inline: true });
  }
  if (data.ytdChangePct != null) {
    embed.addFields({ name: 'YTD Return', value: `${data.ytdChangePct}%`, inline: true });
  }

  return embed;
}

// ── News Embed ────────────────────────────────────────────────────────────────

function buildNewsEmbed(ticker, articles) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`📰 Latest News — ${ticker}`)
    .setFooter({ text: 'Via Yahoo Finance / Google News' })
    .setTimestamp();

  if (!articles || articles.length === 0) {
    embed.setDescription('No recent news found for this ticker.');
    return embed;
  }

  const lines = articles.map((a, i) => {
    const date = a.pubDate ? ` · ${formatDate(a.pubDate)}` : '';
    return `**${i + 1}.** [${a.title}](${a.link})${date}`;
  });

  embed.setDescription(lines.join('\n\n'));
  return embed;
}

// ── Fund Snapshot Embed ───────────────────────────────────────────────────────

function buildFundEmbed(ticker, priceData, articles) {
  const arrow = priceData.isUp ? '▲' : '▼';
  const sign = priceData.isUp ? '+' : '';

  const embed = new EmbedBuilder()
    .setColor(priceColor(priceData.isUp))
    .setTitle(`📊 ${ticker} — ${priceData.name}`)
    .setDescription(
      `**$${fmt(priceData.price)}**  ${arrow} ${sign}${fmt(priceData.change)} (${sign}${fmt(priceData.changePct)}%)\n` +
      `${marketStateLabel(priceData.marketState)} · ${priceData.exchange}`
    )
    .addFields(
      { name: 'Open', value: `$${fmt(priceData.open)}`, inline: true },
      { name: 'Prev Close', value: `$${fmt(priceData.previousClose)}`, inline: true },
      { name: 'Day Range', value: `$${fmt(priceData.dayLow)} – $${fmt(priceData.dayHigh)}`, inline: true },
      { name: '52W Range', value: `$${fmt(priceData.low52)} – $${fmt(priceData.high52)}`, inline: true },
      { name: 'Volume', value: fmtVolume(priceData.volume), inline: true },
      { name: 'Avg Volume', value: fmtVolume(priceData.avgVolume), inline: true },
    )
    .setFooter({ text: `Yahoo Finance · ${ticker}` })
    .setTimestamp();

  if (priceData.marketCap) {
    embed.addFields({ name: 'Market Cap / AUM', value: fmtMarketCap(priceData.marketCap), inline: true });
  }
  if (priceData.ytdChangePct != null) {
    embed.addFields({ name: 'YTD Return', value: `${priceData.ytdChangePct}%`, inline: true });
  }

  // News section
  if (articles && articles.length > 0) {
    const newsLines = articles.map((a, i) => {
      const date = a.pubDate ? ` · ${formatDate(a.pubDate)}` : '';
      return `**${i + 1}.** [${a.title}](${a.link})${date}`;
    });
    embed.addFields({ name: '📰 Recent News', value: newsLines.join('\n\n'), inline: false });
  } else {
    embed.addFields({ name: '📰 Recent News', value: 'No recent news found.', inline: false });
  }

  return embed;
}

module.exports = { buildPriceEmbed, buildNewsEmbed, buildFundEmbed };
