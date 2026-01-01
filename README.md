# Sach.ai - AI-Native Food Scanner

An intelligent food analyzer that uses AI to provide personalized dietary insights. Built for the EnCode 2026 Hackathon with a focus on AI-native experience, real-time streaming, and generative UI.

## 🎯 What Makes This AI-Native

### 1. Real Streaming Analysis
- Uses Vercel AI SDK's `streamText` with structured output
- Progressive UI updates as AI thinks
- Visible reasoning process via terminal display
- No blocking calls - smooth, responsive experience

### 2. Generative UI Engine
- AI-generated UI components based on product complexity
- Dynamic visualization selection (charts, lists, cards)
- Adaptive layouts for simple vs complex products
- Components stream in progressively with staggered animations

### 3. Intent Inference
- No upfront profile selection forms
- AI infers dietary preferences from scanned products
- Smart onboarding only for first-time users
- Learns from user decisions over time
- Memory indicator shows learned preferences

### 4. Personalized Learning
- Stores user history in localStorage
- Adapts analysis based on past decisions
- Remembers avoided/preferred ingredients
- Adjusts language complexity based on experience level

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK + Google Gemini 2.5 Flash Lite
- **Language**: TypeScript with Zod schemas
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Mobile**: Capacitor (iOS/Android)
- **OCR**: Tesseract.js
- **Database**: Local OpenFoodFacts subset

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key

### Installation

1. Clone and install:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API key to `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📱 Mobile App Build

### Android
```bash
npm run build:apk:dev
```

### iOS
```bash
npm run cap:ios
```

## 🏗️ Architecture

### Core Flow
```
User Scans Product
    ↓
Intent Inference (infer dietary needs)
    ↓
Streaming AI Analysis (Gemini)
    ↓
Generative UI Engine (dynamic components)
    ↓
Progressive Rendering (staggered animations)
    ↓
User Decision (learn preferences)
```

### Key Components

**Frontend**
- `app/page.tsx` - Main orchestrator with useObject hook
- `components/results/GenerativeRenderer.tsx` - Dynamic component router
- `lib/generative-ui-engine.ts` - UI component generator
- `lib/intent-inference.ts` - Dietary preference inference
- `lib/user-history.ts` - Learning and personalization

**Backend**
- `app/api/analyze/route.ts` - Streaming AI endpoint
- `lib/schemas.ts` - Zod schemas for type safety
- `lib/prompts.ts` - Context-aware system prompts
- `lib/openfoodfacts-db.ts` - Local product database

### Response Types
- **SAFE** - Green shield, celebratory UI
- **RISK** - Red alert, collapsible hierarchy
- **DECISION** - Amber fork, user clarification
- **CLARIFICATION** - Intent confirmation
- **UNCERTAIN** - Gray error, retry prompt

## 🎨 Design System

### Colors
- **Neon Green** `#00FF94` - Safe/positive
- **Danger Red** `#FF4444` - Critical/warning
- **Amber** `#FBBF24` - Decisions/clarifications

### Layout
- Mobile-first (430px container)
- Glassmorphic cards with backdrop blur
- Dynamic Island status bar
- iPhone-style home indicator
- Safe area insets for notches

## 📊 Features

✅ Real-time streaming AI analysis
✅ Generative UI components
✅ Intent inference (no forms)
✅ User preference learning
✅ OCR text extraction
✅ Barcode scanning
✅ Local product database (50+ products)
✅ Offline-capable
✅ Native mobile apps (iOS/Android)
✅ Smooth animations
✅ Error handling with graceful fallbacks

## 🧪 Testing

```bash
npm test
```

## 📄 Documentation

- `ARCHITECTURE.md` - System architecture details
- `DEPLOYMENT_GUIDE.md` - Production deployment guide

## 📝 License

MIT
