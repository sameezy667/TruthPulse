# Sach.ai - Food Scanner

AI-Native food analyzer for the EnCode 2026 Hackathon. Built with Next.js 15, TypeScript, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Font**: Geist Sans & Geist Mono

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── layout.tsx          # Root layout with mobile container
├── page.tsx            # Main orchestrator component
├── globals.css         # Global styles and utilities
components/
├── onboarding/
│   └── ContextForm.tsx # Profile selection chips
├── scanner/
│   └── CameraView.tsx  # Camera viewfinder animation
├── processing/
│   └── ReasoningTerminal.tsx  # Scrolling log terminal
└── results/
    └── ResultCard.tsx  # Dynamic result display
lib/
└── types.ts           # TypeScript type definitions
```

## Features

- Mobile-first design (430px container on desktop)
- Glassmorphic UI with backdrop blur effects
- Smooth Framer Motion animations with AnimatePresence
- URL-based state persistence
- Dynamic Island status bar
- iPhone-style home indicator
- Responsive score visualization
- Expandable molecular findings

## Design System

### Colors
- **Neon Green**: `#00FF94` - Safe/positive states
- **Danger Red**: `#FF4444` - Critical/warning states

### Typography
- Tight tracking for headlines (`-0.025em`)
- Wide tracking for labels (`0.3em`)
- Text balance for headings to prevent widows

### Components
- Glass cards: `bg-white/5 backdrop-blur-xl border border-white/10`
- Mobile container: `max-w-[430px]` with side borders
- Safe area insets: `pt-safe` and `pb-safe` utilities

## License

MIT
