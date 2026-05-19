require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { getPrice } = require("./src/price");
const { getNews } = require("./src/news");
const {
  buildFundEmbed,
  buildPriceEmbed,
  buildNewsEmbed,
} = require("./src/embeds");
const commands = require("./src/commands");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("✅ Slash commands registered globally");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const ticker = interaction.options.getString("ticker")?.toUpperCase().trim();

  await interaction.deferReply();

  try {
    if (commandName === "price") {
      const data = await getPrice(ticker);
      const embed = buildPriceEmbed(ticker, data);
      await interaction.editReply({ embeds: [embed] });
    } else if (commandName === "news") {
      const articles = await getNews(ticker);
      const embed = buildNewsEmbed(ticker, articles);
      await interaction.editReply({ embeds: [embed] });
    } else if (commandName === "fund") {
      // Use allSettled so a news failure doesn't kill the whole command
      const [priceResult, newsResult] = await Promise.allSettled([
        getPrice(ticker),
        getNews(ticker),
      ]);

      // Price is required — if it failed, bubble up to outer catch
      if (priceResult.status === "rejected") {
        throw priceResult.reason;
      }

      const priceData = priceResult.value;
      const articles =
        newsResult.status === "fulfilled" ? newsResult.value : [];

      if (newsResult.status === "rejected") {
        console.warn(
          `[fund] News fetch failed for ${ticker}:`,
          newsResult.reason.message,
        );
      }

      const embed = buildFundEmbed(ticker, priceData, articles);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(`[${commandName}] Error for ${ticker}:`, err.message);
    await interaction.editReply({
      content: `❌ Could not fetch data for **${ticker}**. Make sure it's a valid ticker (e.g. \`SPY\`, \`QQQ\`, \`VTI\`).`,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
