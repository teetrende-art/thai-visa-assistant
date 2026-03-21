# 🛂 Thai Visa Assistant

AI-powered Thai visa Q&A Telegram bot for expats.

## Quick Start

### 1. Create Telegram Bot
1. Open @BotFather on Telegram
2. Type `/newbot`
3. Follow instructions, get your **Bot Token**

### 2. Get OpenRouter API Key (Optional - for AI)
1. Go to https://openrouter.ai/
2. Sign up, get free credits
3. Create API key

### 3. Deploy

#### Option A: Render.com (Free)
1. Push code to GitHub
2. Connect to Render.com
3. Set environment variables:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `OPENROUTER_API_KEY` = your API key (optional)
4. Deploy

#### Option B: Railway
1. Connect GitHub to Railway
2. Set env vars
3. Deploy

#### Option C: DigitalOcean (VPS)
```bash
cd /root/.openclaw/workspace/projects/thai-visa-assistant
npm install
cp .env.example .env
# Edit .env with your tokens
npm start
```

### 4. Deploy Landing Page

#### Vercel (Easiest)
1. Push to GitHub
2. Connect to Vercel
3. Deploy!

#### Or: nchobah.com
Upload `index.html` via cPanel File Manager to `public_html`

### 5. Update Bot Links
- Edit `index.html` - replace `YOUR_BOT_USERNAME` with your actual bot username
- Test the bot!

## Features

- ✅ Tourist visa info & extensions
- ✅ Elite Visa details
- ✅ Work permit requirements
- ✅ Retirement visa info
- ✅ AI-powered Q&A
- ✅ Quick links to official sources
- ✅ Multi-language support ready

## Project Structure

```
thai-visa-assistant/
├── src/
│   └── bot.js          # Telegram bot code
├── index.html          # Landing page
├── package.json        # Dependencies
├── .env.example        # Env template
├── SPEC.md            # Specification
└── README.md          # This file
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| TELEGRAM_BOT_TOKEN | Yes | From @BotFather |
| OPENROUTER_API_KEY | No | For AI answers (fallback works without) |

## Tech Stack

- **Bot:** Grammy (Telegram)
- **AI:** OpenRouter (DeepSeek)
- **Hosting:** Render/Railway/VPS
- **Landing:** Vercel/Static

## License

MIT
