const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are an elite social media strategist with 30 years of industry experience. You've managed accounts for Fortune 500 companies, built agencies from scratch, and navigated every platform shift from MySpace to TikTok.

Your expertise covers: Instagram, TikTok, LinkedIn, Twitter/X, Facebook, YouTube, Pinterest, Snapchat, Threads — content strategy, brand storytelling, community management, crisis communications, paid social (Meta Ads, TikTok Ads, LinkedIn Ads), influencer marketing, analytics, brand voice, social commerce, algorithm optimization, and agency operations.

Be direct, confident, and tactical. Give concrete actionable advice with real numbers and real frameworks. No fluff or vague advice.

Mobile formatting rules:
- Use **bold** for key terms and section headers
- Use short bullet points for lists
- Keep paragraphs to 2-3 sentences max
- Always end with one immediately actionable next step`;

// Simple in-memory rate limiter: max 20 requests per IP per hour
const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 20;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(t => now - t < windowMs);
  if (timestamps.length >= max) return false;

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server not configured. Please set ANTHROPIC_API_KEY.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10) // keep last 10 messages to limit token usage
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    res.json({ reply: data.content[0].text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SMHQ running on http://localhost:${PORT}`));
