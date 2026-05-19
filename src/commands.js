const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get the current price and performance of an ETF or index fund')
    .addStringOption(opt =>
      opt.setName('ticker')
        .setDescription('Ticker symbol (e.g. SPY, QQQ, VTI)')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('news')
    .setDescription('Get the latest news headlines for an ETF or index fund')
    .addStringOption(opt =>
      opt.setName('ticker')
        .setDescription('Ticker symbol (e.g. SPY, QQQ, VTI)')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('fund')
    .setDescription('Full snapshot: price data + news for an ETF or index fund')
    .addStringOption(opt =>
      opt.setName('ticker')
        .setDescription('Ticker symbol (e.g. SPY, QQQ, VTI)')
        .setRequired(true)
    )
    .toJSON(),
];
