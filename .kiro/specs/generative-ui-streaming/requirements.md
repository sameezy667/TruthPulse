# Requirements Document

## Introduction

This specification defines the requirements for upgrading Sach.ai from a prototype fetch-and-wait architecture to a production-grade application using Vercel AI SDK with streaming Generative UI. The system will render the interface incrementally as the AI reasons, providing real-time visual feedback to users analyzing food products.

## Glossary

- **Generative_UI**: A user interface pattern where UI components are rendered incrementally as AI generates structured data, creating a dynamic, real-time experience
- **Stream_Object**: Vercel AI SDK function that streams typed JSON objects conforming to a Zod schema from an AI model to the client
- **Discriminated_Union**: A TypeScript/Zod pattern using a common discriminator field (e.g., `type`) to distinguish between different response shapes
- **Partial_Rendering**: The ability to render UI components with incomplete data as it streams in, handling undefined or partial fields gracefully
- **AI_Response**: The structured output from the AI model containing analysis results in one of four scenarios: SAFE, RISK, DECISION, or UNCERTAIN
- **User_Profile**: The dietary context (DIABETIC, VEGAN, or PALEO) that determines analysis criteria
- **Vercel_AI_SDK**: The official Vercel library for building AI-powered streaming applications with type safety
- **Deep_Partial**: A TypeScript utility type that makes all properties and nested properties optional, essential for streaming data

## Requirements

### Requirement 1: Streaming Infrastructure

**User Story:** As a developer, I want to use Vercel AI SDK with streaming capabilities, so that the application can deliver real-time AI responses without blocking.

#### Acceptance Criteria

1. WHEN the application is built, THE System SHALL use `ai` package from Vercel AI SDK
2. WHEN the application is built, THE System SHALL use `@ai-sdk/google` package for Gemini integration
3. WHEN dependencies are installed, THE System SHALL include `framer-motion` for animations
4. WHEN dependencies are installed, THE System SHALL include `clsx` and `tailwind-merge` for styling utilities
5. THE System SHALL use TypeScript with strict type checking and no `any` types

### Requirement 2: Type-Safe Schema Definition

**User Story:** As a developer, I want a strict Zod schema with discriminated unions, so that streaming data is type-safe and the UI can render different components based on response type.

#### Acceptance Criteria

1. THE Schema SHALL define a discriminated union on a field named `type`
2. WHEN `type` is `SAFE`, THE Schema SHALL require fields: `summary` (string) and `safeBadge` (boolean)
3. WHEN `type` is `RISK`, THE Schema SHALL require fields: `headline` (string) and `riskHierarchy` (array of risk items)
4. WHEN a risk item is defined, THE Schema SHALL require fields: `ingredient` (string), `severity` (enum: 'high' or 'med'), and `reason` (string)
5. WHEN `type` is `DECISION`, THE Schema SHALL require fields: `question` (string) and `options` (tuple of 'Strict' and 'Flexible')
6. WHEN `type` is `UNCERTAIN`, THE Schema SHALL require field: `rawText` (string)
7. THE Schema SHALL be exported from `lib/schemas.ts` as `AIResponseSchema`
8. THE Schema SHALL be compatible with Vercel AI SDK's `streamObject` function

### Requirement 3: Streaming API Endpoint

**User Story:** As a user, I want the backend to stream analysis results in real-time, so that I can see the AI reasoning as it happens rather than waiting for a complete response.

#### Acceptance Criteria

1. WHEN the API route receives a POST request, THE System SHALL accept `imageBase64` and `userProfile` in the request body
2. WHEN processing a request, THE System SHALL use `streamObject` from the `ai` package
3. WHEN configuring the AI model, THE System SHALL use `google('gemini-2.5-flash-lite')` from `@ai-sdk/google`
4. WHEN calling `streamObject`, THE System SHALL provide the `AIResponseSchema` as the schema parameter
5. WHEN generating the system prompt, THE System SHALL include user profile context and schema instructions
6. WHEN generating the user prompt, THE System SHALL include the base64 image data
7. WHEN streaming completes, THE System SHALL return `result.toDataStreamResponse()`
8. WHEN an error occurs, THE System SHALL handle it gracefully and return an UNCERTAIN response type

### Requirement 4: Client-Side Streaming Hook

**User Story:** As a user, I want the frontend to receive and display streaming data in real-time, so that I can see analysis results appear progressively as the AI generates them.

#### Acceptance Criteria

1. WHEN the main page component initializes, THE System SHALL use `experimental_useObject` hook from `ai/react`
2. WHEN configuring the hook, THE System SHALL provide the API endpoint `/api/analyze`
3. WHEN configuring the hook, THE System SHALL provide the `AIResponseSchema` as the schema parameter
4. WHEN a user scans an image, THE System SHALL call the `submit` function with `imageBase64` and `userProfile`
5. WHEN streaming is active, THE System SHALL expose an `object` containing partial data
6. WHEN streaming is active, THE System SHALL expose an `isLoading` boolean state
7. WHEN an error occurs, THE System SHALL expose an `error` object
8. WHEN streaming data is received, THE System SHALL pass the partial `object` to the rendering component

### Requirement 5: Generative Renderer Component

**User Story:** As a user, I want the UI to render incrementally as data streams in, so that I can see results appear in real-time without waiting for the complete response.

#### Acceptance Criteria

1. THE Generative_Renderer SHALL accept a prop `data` of type `DeepPartial<AIResponse>`
2. WHEN `data.type` is undefined, THE Generative_Renderer SHALL display a loading state
3. WHEN `data.type` is `SAFE`, THE Generative_Renderer SHALL render the `SafeCard` component
4. WHEN `data.type` is `RISK`, THE Generative_Renderer SHALL render the `RiskHierarchy` component
5. WHEN `data.type` is `DECISION`, THE Generative_Renderer SHALL render the `DecisionFork` component
6. WHEN `data.type` is `UNCERTAIN`, THE Generative_Renderer SHALL render the `UncertainCard` component
7. WHEN rendering risk hierarchy items, THE Generative_Renderer SHALL use `AnimatePresence` from Framer Motion
8. WHEN new risk items stream into the array, THE Generative_Renderer SHALL animate them in with Framer Motion
9. WHEN data fields are undefined or partial, THE Generative_Renderer SHALL handle them gracefully without crashing

### Requirement 6: Partial Data Handling

**User Story:** As a developer, I want all result components to handle partial data gracefully, so that the UI doesn't crash when streaming incomplete objects.

#### Acceptance Criteria

1. WHEN `SafeCard` receives partial data, THE Component SHALL handle undefined `summary` field gracefully
2. WHEN `RiskHierarchy` receives partial data, THE Component SHALL handle undefined `headline` field gracefully
3. WHEN `RiskHierarchy` receives partial data, THE Component SHALL handle empty or undefined `riskHierarchy` array gracefully
4. WHEN `DecisionFork` receives partial data, THE Component SHALL handle undefined `question` field gracefully
5. WHEN `DecisionFork` receives partial data, THE Component SHALL handle undefined `options` array gracefully
6. WHEN `UncertainCard` receives partial data, THE Component SHALL handle undefined `rawText` field gracefully
7. WHEN any component receives undefined string fields, THE Component SHALL display a loading skeleton or placeholder

### Requirement 7: Loading States and Skeletons

**User Story:** As a user, I want to see loading skeletons while data is streaming, so that I understand the system is working and can anticipate the layout.

#### Acceptance Criteria

1. WHEN `data.type` is `RISK` but `riskHierarchy` is empty, THE System SHALL display a pulsing skeleton layout
2. WHEN displaying a skeleton, THE System SHALL match the expected height of the risk hierarchy component
3. WHEN string fields are undefined during streaming, THE System SHALL display text skeletons with appropriate widths
4. WHEN streaming is in progress, THE System SHALL prevent layout shift by reserving space for incoming content
5. WHEN the `isLoading` state is true, THE System SHALL display a reasoning loader component

### Requirement 8: Error Handling and Resilience

**User Story:** As a user, I want clear error messages when analysis fails, so that I understand what went wrong and can take appropriate action.

#### Acceptance Criteria

1. WHEN the `error` object is present in the hook, THE System SHALL display an error message
2. WHEN displaying an error, THE System SHALL show a toast notification with variant "destructive"
3. WHEN an error occurs, THE Error_Message SHALL state: "Analysis failed. Please try again."
4. WHEN a network failure occurs during streaming, THE System SHALL handle it gracefully without crashing
5. WHEN the API key is missing or invalid, THE System SHALL return an UNCERTAIN response with a clear message
6. WHEN the AI model is unavailable, THE System SHALL return an UNCERTAIN response with a clear message
7. WHEN JSON parsing fails, THE System SHALL return an UNCERTAIN response with a clear message

### Requirement 9: Branding Consistency

**User Story:** As a product owner, I want all references to "TruthPulse" replaced with "Sach.ai", so that the application reflects the correct brand identity.

#### Acceptance Criteria

1. WHEN searching the codebase, THE System SHALL contain no references to "TruthPulse"
2. WHEN searching the codebase, THE System SHALL contain no references to "truthpulse"
3. WHEN the application displays text, THE System SHALL use "Sach.ai" as the product name
4. WHEN system prompts reference the application, THE System SHALL use "Sach.ai"
5. WHEN metadata or configuration files reference the application, THE System SHALL use "Sach.ai" or "sachai"

### Requirement 10: Mobile-First Layout

**User Story:** As a mobile user, I want all new components to respect the mobile container layout, so that the interface remains usable on small screens.

#### Acceptance Criteria

1. WHEN rendering the Generative Renderer, THE System SHALL respect a maximum width of 430px
2. WHEN rendering on mobile devices, THE System SHALL ensure all interactive elements are touch-friendly
3. WHEN rendering animations, THE System SHALL ensure they perform smoothly on mobile devices
4. WHEN streaming data causes layout changes, THE System SHALL prevent horizontal scrolling
5. WHEN displaying the interface, THE System SHALL account for safe areas on notched devices

### Requirement 11: Build and Type Safety

**User Story:** As a developer, I want the application to pass TypeScript compilation, so that type errors are caught at build time rather than runtime.

#### Acceptance Criteria

1. WHEN running `npm run build`, THE System SHALL complete successfully without TypeScript errors
2. WHEN running `npm run build`, THE System SHALL complete successfully without ESLint errors
3. WHEN TypeScript analyzes the code, THE System SHALL contain no `any` types
4. WHEN TypeScript analyzes streaming data, THE System SHALL correctly infer types from the Zod schema
5. WHEN TypeScript analyzes partial data, THE System SHALL correctly type `DeepPartial` utility types

### Requirement 12: Capacitor Compatibility

**User Story:** As a developer, I want the streaming implementation to be compatible with Capacitor builds, so that the app can be deployed as a native mobile application.

#### Acceptance Criteria

1. WHEN building for Capacitor, THE System SHALL configure `images.unoptimized = true` in Next.js config
2. WHEN running on native platforms, THE Streaming_API SHALL function correctly over native HTTP clients
3. WHEN running on native platforms, THE System SHALL handle network interruptions gracefully
4. WHEN building for Android, THE System SHALL include all necessary assets in the build output
5. WHEN building for iOS, THE System SHALL include all necessary assets in the build output

### Requirement 13: Cleanup and Migration

**User Story:** As a developer, I want obsolete code removed, so that the codebase remains clean and maintainable.

#### Acceptance Criteria

1. WHEN the migration is complete, THE System SHALL remove `lib/data.ts` if it contains mock data
2. WHEN the migration is complete, THE System SHALL remove the old `@google/generative-ai` package
3. WHEN the migration is complete, THE System SHALL remove the `selectAvailableModel` function from the API route
4. WHEN the migration is complete, THE System SHALL remove blocking `generateContent` calls
5. WHEN the migration is complete, THE System SHALL remove manual JSON parsing logic from the API route
