# Task 3.6: App Flow Diagram

## Before (Old Flow)
```
User Opens App
    ↓
Profile Selection Screen (ContextForm)
    ↓
User Selects Profile (Vegan/Diabetic/Paleo)
    ↓
Camera View
    ↓
User Scans Product
    ↓
API Analysis (with selected profile)
    ↓
Results Display
```

## After (New Flow with Intent Inference)

### First-Time User Flow
```
User Opens App
    ↓
Load History → None Found
    ↓
Initialize New History
    ↓
Smart Onboarding Screen
    ↓
User Clicks "Start Scanning"
    ↓
Camera View
    ↓
User Scans Product
    ↓
Infer Intent (from image)
    ↓
API Analysis (with inferred context)
    ↓
Results Display
    ↓
User Makes Decision
    ↓
Learn & Save to History
```

### Returning User Flow
```
User Opens App
    ↓
Load History → Found!
    ↓
Skip Onboarding
    ↓
Camera View (with learned profile)
    ↓
User Scans Product
    ↓
Infer Intent (from image + history)
    ↓
API Analysis (with learned preferences)
    ↓
Results Display
    ↓
User Makes Decision
    ↓
Learn & Update History
```

### Clarification Flow
```
User Scans Product
    ↓
Infer Intent → Low Confidence
    ↓
API Returns CLARIFICATION
    ↓
Show Clarification Card
    ↓
User Answers Question
    ↓
Learn from Answer
    ↓
Re-analyze with Clarification
    ↓
Results Display
```

## Key Improvements

1. **No Forms** - Users never fill out profile selection forms
2. **Instant Start** - Returning users go straight to camera
3. **Learning** - System learns from every decision
4. **Context-Aware** - Analysis adapts to user history
5. **Clarification** - System asks questions when uncertain
6. **Persistence** - Preferences saved across sessions

## State Management

### New State Variables
- `userHistory: UserHistory | null` - Loaded from localStorage
- `showOnboarding: boolean` - Controls onboarding visibility
- `inferredIntent: InferredIntent | null` - Stores inferred context

### Key Functions
- `loadUserHistory()` - Loads from localStorage on mount
- `inferIntent()` - Infers user intent before analysis
- `learnFromDecision()` - Updates history after decisions
- `saveUserHistory()` - Persists to localStorage
- `handleClarificationAnswer()` - Handles clarification responses

## Data Flow

```
localStorage
    ↓
loadUserHistory()
    ↓
userHistory state
    ↓
inferIntent(image, history)
    ↓
submit({ imageBase64, inferredIntent, userHistory })
    ↓
API Analysis
    ↓
Results
    ↓
User Decision
    ↓
learnFromDecision(history, decision)
    ↓
saveUserHistory(updatedHistory)
    ↓
localStorage
```

