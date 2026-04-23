# SMHQ — Social Media HQ

AI-powered social media expert anyone can use. No API key required from users — you host it, you pay for usage, everyone else just opens the site and chats.

---

## What's in this folder

```
smhq/
├── server.js        ← Backend (Node.js/Express) — keeps your API key safe
├── package.json     ← Dependencies
├── .env.example     ← Copy this to .env and add your key
├── .gitignore       ← Prevents .env being committed to git
└── public/
    └── index.html   ← The full mobile frontend
```

---

## Setup (run locally first)

**1. Install Node.js** (if you don't have it)
→ https://nodejs.org — download the LTS version

**2. Add your API key**
```bash
cp .env.example .env
```
Then open `.env` and replace the placeholder with your real Anthropic API key.
Get one free at: https://console.anthropic.com

**3. Install dependencies**
```bash
npm install
```

**4. Start the server**
```bash
npm start
```

**5. Open in browser**
→ http://localhost:3000

---

## Deploy so anyone can use it (3 options)

### Option A — Railway (easiest, ~$5/mo)
1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Push this folder to a GitHub repo first, then connect it
4. In Railway settings, add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
5. Railway gives you a public URL automatically — share it with anyone

### Option B — Render (free tier available)
1. Go to https://render.com and sign up
2. New → Web Service → connect your GitHub repo
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
6. Deploy — you get a public `.onrender.com` URL

### Option C — VPS (Digital Ocean, Linode, etc.)
1. Get a $6/mo droplet
2. SSH in, clone your repo
3. Run `npm install`
4. Create `.env` with your API key
5. Use PM2 to keep it running: `npm install -g pm2 && pm2 start server.js`
6. Point your domain at the server IP

---

## Costs to expect

- **Hosting**: $0–$10/mo depending on platform
- **API usage**: ~$0.003 per conversation message (very cheap)
- 1,000 users having 5-message conversations ≈ ~$15 in API costs

---

## Rate limiting

The server limits each IP to **20 requests per hour** to prevent abuse.
You can change this in `server.js` — look for `const max = 20`.

---

## Custom domain

Once deployed on Railway or Render, you can add your own domain (e.g. smhq.com)
in the platform's settings under "Custom Domain".
