# 📈 ETF & Index Fund Discord Bot

A Discord bot that gives you on-demand price data and news for ETFs and index funds using slash commands.

## Commands

| Command | Description |
|---|---|
| `/price SPY` | Current price, change, volume, 52W range |
| `/news QQQ` | Latest 5 news headlines |
| `/fund VTI` | Full snapshot: price + news combined |

Works with any valid Yahoo Finance ticker: `SPY`, `QQQ`, `VTI`, `VOO`, `IWM`, `GLD`, `BND`, etc.

---

## Setup

### 1. Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**, give it a name
3. Go to **Bot** → click **Add Bot**
4. Under **Token**, click **Reset Token** and copy it
5. Under **Privileged Gateway Intents**, no extras are needed for slash commands
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`
   - Copy the generated URL and open it to invite the bot to your server

### 2. Configure the Bot

```bash
# Clone or download this project, then:
cp .env.example .env
```

Edit `.env` and paste your bot token:
```
DISCORD_TOKEN=your_actual_token_here
```

### 3. Install & Run

```bash
npm install
node index.js
```

You should see:
```
✅ Logged in as YourBot#1234
✅ Slash commands registered globally
```

> **Note:** Global slash commands can take up to 1 hour to propagate. For instant registration during development, see the tip below.

---

## Tips

### Instant command registration (dev mode)
To register commands instantly to a single server, replace the registration call in `index.js`:
```js
// Change this:
Routes.applicationCommands(client.user.id)

// To this (replace GUILD_ID with your server's ID):
Routes.applicationGuildCommands(client.user.id, 'YOUR_GUILD_ID')
```
Get your server ID by enabling Developer Mode in Discord settings, then right-clicking your server.

### Keeping the bot online
Use [PM2](https://pm2.keymetrics.io/) to keep it running:
```bash
npm install -g pm2
pm2 start index.js --name etf-bot
pm2 save
```

Or deploy to a free service like [Railway](https://railway.app) or [Render](https://render.com).

---

## Data Sources
- **Prices**: Yahoo Finance (via `yahoo-finance2`)
- **News**: Yahoo Finance RSS + Google News RSS fallback
- No API keys required beyond your Discord token!
"# SP-Calls" 
