# Bad as e bad

A cinematic, scene-based Valentine's Day proposal experience built with Next.js. No scrolling, no navigation — just intentional pacing and emotional storytelling that unfolds like a short film.

## Features

- **Scene-based storytelling** — A sequence of timed scenes that build emotional momentum
- **Typewriter effect** — Montage lines typed out character by character for added weight
- **Starfield & film grain** — Atmospheric visual layers for a cinematic feel
- **Ambient audio** — Background music and sound effects that respond to interactions
- **Email notifications** — Sends an email via Resend when a response is given
- **Fully responsive** — Works on mobile and desktop

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Framer Motion](https://motion.dev) — Animations and scene transitions
- [Tone.js](https://tonejs.github.io) — Audio synthesis and playback
- [Resend](https://resend.com) — Email delivery
- [Tailwind CSS](https://tailwindcss.com) 4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience.

## Environment Variables

Create a `.env.local` file with:

```
RESEND_API_KEY=your_resend_api_key
```

## Deploy

The easiest way to deploy is with [Vercel](https://vercel.com).
