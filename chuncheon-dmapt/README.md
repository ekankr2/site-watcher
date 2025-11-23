# Chuncheon DMAPT Scraper

Board scraper with email alerts. Runs every 10 minutes on Railway.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with Gmail credentials
```

Gmail App Password: https://myaccount.google.com/apppasswords

## Run

```bash
npm run check   # Test once
npm start       # Start server
```

## Railway Deploy

1. Set env vars: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `TO_EMAIL`
2. Add volume at `/app/data`
3. Deploy: `railway up`
4. Add cron: `*/10 * * * *` → `curl https://your-app.railway.app/cron/check`