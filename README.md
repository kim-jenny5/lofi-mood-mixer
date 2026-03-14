# Lofi Mood Mixer 🌲🎧

A cozy soundscape mixer for focus, calm, and those moments when you just need to lock in.

**Lofi Mood Mixer** lets you craft the exact ambience you want while listening to lofi hip hop, all set against a nostalgic **retro pixel-art camping scene**. 👾

Adjust the **time of day, weather, warmth, and nature intensity** to create a soundscape that fits your mood. Whether you're studying, working, relaxing, or simply taking a quiet moment, the environment adapts with you!

Living in New York City, the pace of life can feel relentless. Everything moves fast, all the time. I built Lofi Mood Mixer as a small escape from that rhythm. 🥹 A place to slow down for a moment and enjoy the stillness. Rain falling on a tent, a crackling campfire, crickets coming out at dusk.

This app is a little pocket of that slower world. 😌

---

## Demo

Try it live:

👉 **https://lofi-mood-mixer.vercel.app**

---

## Preview

<img width="540" height="486" alt="Screenshot 2026-03-14 at 2 42 20 AM" src="https://github.com/user-attachments/assets/09471d60-e3a1-4ec6-9f4c-045a42d99002" />
<img width="540" height="486" alt="Screenshot 2026-03-14 at 2 41 04 AM" src="https://github.com/user-attachments/assets/d51767ae-848d-4947-86d3-d1391a7a06e4" />

---

## ✨ Features

### Ambient Sound Mixing

Use sliders to fine-tune your environment:

- ☀️ **Time**: Move through the day from sunrise to midnight.

- 🔥 **Warmth**: Control the intensity of the campfire and cozy lighting.

- 🌧 **Weather**: From clear skies to steady rainfall.

- 🍃 **Nature**: Quiet forest ambience to lively nighttime sounds.

All layers blend together dynamically so the environment feels alive and responsive.

---

### 🏕 Retro Pixel Camping Scene

The background scene reacts to your settings:

- Campfire glow increases with warmth
- Rain appears and intensifies with the weather slider
- Daytime forest sounds gradually shift into nighttime crickets
- Lighting changes naturally across the day

The visual style leans into **retro pixel game nostalgia** to create a calm and comforting atmosphere.

---

### 🎵 Lofi Radio Soundtrack

All ambience sits beneath the iconic [**Lofi Girl stream**](https://www.youtube.com/watch?v=jfKfPfyJRdk), giving you a familiar soundtrack for focus while the environment evolves around it.

---

### Presets

Quickly jump into curated environments:

- 🔥 Campfire Glow  
- 🌙 Midnight Study  
- 🌧 Rainy Morning  
- 🌅 Golden Dusk  
- 🌿 Forest Nap  

Perfect starting points when you just want to press play and settle in.

---

### Save Your Own Vibes

Create up to **3 custom soundscapes** and revisit them anytime.

Great for:

- your favorite focus setup
- a rainy study session
- a late-night wind-down atmosphere

Saved presets are stored locally using **localStorage** so they are always there when you return.

---

## 🧰 Tech Stack

**Framework**

- Next.js (App Router)
- React
- TypeScript

**Animation**

- Framer Motion

**Styling**

- CSS Modules

**Audio**

- Web Audio API
- Layered ambient sound mixing

**Icons**

- Lucide

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/lofi-mood-mixer.git
```

Navigate into the project:

```bash
cd lofi-mood-mixer
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

```bash
http://localhost:3000
```

## Build for Production

```bash
npm run build
npm start
```

## Design Philosophy

This project focuses on three ideas:

**Calm Interaction**

Sliders and presets allow users to shape their environment gradually rather than selecting rigid modes.

**Atmosphere First**

The experience is designed to feel immersive rather than purely functional.

Small touches like:
- lighting changes
- audio layering
- pixel art ambience
- subtle animation
- create a relaxing environment rather than a typical music player.

**Nostalgia**

The retro pixel scene is inspired by cozy camping moments in old games and late-night programming sessions.

**Future Ideas**

Potential improvements:
- more environments (cabin, library, rainy city window)
- seasonal themes
- additional sound layers (wind, river, fireplace)
