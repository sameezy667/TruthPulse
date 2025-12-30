# Sach.ai Architecture Overview

## Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

   1. SETUP (ContextForm)
      ↓
   [User selects profile: DIABETIC / VEGAN / PALEO]
      ↓
   URL updates: ?mode=diabetic
      ↓

   2. SCANNER (CameraView)
      ↓
   [User taps hidden dev menu: top-right corner]
      ↓
   • 1 tap  → 'granola-bar'
   • 2 taps → 'almond-butter'
   • 3 taps → 'protein-shake'
      ↓

   3. REASONING (ReasoningTerminal)
      ↓
   [Terminal displays profile-specific logs]
      ↓
   • DIABETIC: "SCANNING: HIDDEN_SUGAR_PROFILES..."
   • VEGAN:    "SCANNING: ANIMAL_BYPRODUCTS..."
   • PALEO:    "SCANNING: PROCESSED_GRAINS..."
      ↓
   [Parallel: analyzeProduct() runs in background]
      ↓
   [2.5s simulated latency]
      ↓

   4. RESULT (ResultCard)
      ↓
   [Dynamic content based on AnalysisResult]
      ↓
   • Safe:     Green score (94), ShieldCheck icon
   • Danger:   Red score (18), AlertOctagon icon
   • Tradeoff: Yellow score (68), balanced pros/cons


┌─────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                             │
└─────────────────────────────────────────────────────────────────────┘

app/page.tsx (Orchestrator)
  ↓
  ├─ step: AppStep (SETUP → SCANNER → REASONING → RESULT)
  ├─ profile: UserProfile (DIABETIC / VEGAN / PALEO)
  ├─ analysis: AnalysisResult | null
  └─ selectedProduct: string ('granola-bar' | 'almond-butter' | 'protein-shake')


┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
└─────────────────────────────────────────────────────────────────────┘

lib/data.ts
  ↓
  PRODUCTS = {
    'granola-bar': {
      sugar: 12g,        // High (danger for diabetics)
      ingredients: [     // Contains honey (danger for vegans)
        "Oats",          // Grain (danger for paleo)
        "Honey",
        ...
      ]
    },
    'almond-butter': {
      sugar: 1g,         // Low (safe for diabetics)
      ingredients: [     // 100% plant-based (safe for vegans)
        "Raw Almonds"    // Unprocessed (safe for paleo)
      ]
    },
    'protein-shake': {
      sugar: 2g,         // Low (safe for diabetics)
      ingredients: [     // Contains whey (danger for vegans)
        "Whey Protein",  // Processed (tradeoff for paleo)
        "Sucralose"      // Artificial (concern for paleo)
      ]
    }
  }
  ↓
  analyzeProduct(productId, profile) → AnalysisResult
  ↓
  • Calls profile-specific analysis function
  • Returns status: 'safe' | 'danger' | 'tradeoff'
  • Includes detailed findings, metrics, pros/cons


┌─────────────────────────────────────────────────────────────────────┐
│                        COMPONENT TREE                               │
└─────────────────────────────────────────────────────────────────────┘

app/layout.tsx (Root)
  ├─ Mobile Container (430px)
  └─ Geist Fonts

app/page.tsx (Client Orchestrator)
  ├─ AnimatePresence
  │
  ├─ ContextForm (step === SETUP)
  │   └─ 3 profile cards with hover animations
  │
  ├─ CameraView (step === SCANNER)
  │   ├─ Hidden dev menu (top-right tap zone)
  │   ├─ Pulsing viewfinder
  │   └─ Scanning animation
  │
  ├─ ReasoningTerminal (step === REASONING)
  │   ├─ Typewriter effect logs
  │   └─ Blinking cursor
  │
  └─ ResultCard (step === RESULT)
      ├─ Dynamic score visualization
      ├─ Expandable findings
      ├─ Glassmorphic navigation
      └─ Functional buttons (back, export, menu)


┌─────────────────────────────────────────────────────────────────────┐
│                        TYPE SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────┘

lib/types.ts

UserProfile (enum)
  ├─ DIABETIC
  ├─ VEGAN
  └─ PALEO

AppStep (enum)
  ├─ SETUP
  ├─ SCANNER
  ├─ REASONING
  └─ RESULT

AnalysisResult (interface)
  ├─ title: string
  ├─ status: 'safe' | 'danger' | 'tradeoff'
  ├─ description: string
  ├─ details: string[]
  ├─ metrics?: Array<{ name: string; value: number }>
  ├─ pros?: string[]
  └─ cons?: string[]


┌─────────────────────────────────────────────────────────────────────┐
│                        DESIGN SYSTEM                                │
└─────────────────────────────────────────────────────────────────────┘

Colors:
  ├─ Primary:   #00FF94 (neon green)
  ├─ Danger:    #FF4444 (red)
  ├─ Safe:      emerald-500
  └─ Tradeoff:  amber-500

Animations:
  ├─ Physics:   Spring (stiffness: 300, damping: 30)
  ├─ Duration:  250ms (rapid), 1.5s (dramatic)
  └─ Easing:    Apple-style bounce

Shapes:
  ├─ Buttons:   rounded-full (pill mandate)
  ├─ Cards:     rounded-3xl (large radius)
  └─ Pills:     rounded-full with 90% sizing

Effects:
  ├─ Glassmorphism: backdrop-blur-xl + border-white/10
  ├─ Gradients:     Animated green orbs (top-to-bottom movement)
  └─ Hover:         Subtle scale (1.005x) + shimmer
