import { AIResponse, RiskItem } from './schemas';
import { UserProfile } from './types';

/**
 * UI Component interface for dynamically generated components
 */
export interface UIComponent {
  type: 'text' | 'badge' | 'card' | 'list' | 'chart';
  props: Record<string, any>;
  children?: UIComponent[];
}

/**
 * Product complexity metrics
 */
interface ComplexityMetrics {
  ingredientCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  hasDecision: boolean;
}

/**
 * Analyze product complexity from AI response
 */
function analyzeComplexity(analysis: AIResponse): ComplexityMetrics {
  const ingredientCount = analysis.type === 'RISK' && analysis.riskHierarchy 
    ? analysis.riskHierarchy.length 
    : 0;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (analysis.type === 'RISK' && analysis.riskHierarchy) {
    const highRisks = analysis.riskHierarchy.filter(r => r.severity === 'high').length;
    if (highRisks > 0) {
      riskLevel = 'high';
    } else if (analysis.riskHierarchy.length > 3) {
      riskLevel = 'medium';
    }
  }
  
  return {
    ingredientCount,
    riskLevel,
    hasDecision: false, // DECISION type removed
  };
}

/**
 * Generate UI components for SAFE response
 */
async function* generateSafeUI(
  analysis: AIResponse,
  complexity: ComplexityMetrics
): AsyncGenerator<UIComponent> {
  // Simple badge for safe products
  yield {
    type: 'badge',
    props: {
      variant: 'success',
      text: '✓ Safe',
    },
  };
  
  await delay(150);
  
  // Summary text
  if (analysis.summary) {
    yield {
      type: 'text',
      props: {
        content: analysis.summary,
        size: 'large',
        weight: 'normal',
      },
    };
  }
}

/**
 * Generate UI components for RISK response
 */
async function* generateRiskUI(
  analysis: AIResponse,
  complexity: ComplexityMetrics
): AsyncGenerator<UIComponent> {
  // Headline
  if (analysis.headline) {
    yield {
      type: 'text',
      props: {
        content: analysis.headline,
        size: 'large',
        weight: 'bold',
        color: 'warning',
      },
    };
    
    await delay(200);
  }
  
  // For complex products (9+ ingredients), use chart visualization
  if (complexity.ingredientCount >= 9 && analysis.riskHierarchy) {
    yield {
      type: 'chart',
      props: {
        data: analysis.riskHierarchy.map(item => ({
          label: item.ingredient,
          value: item.severity === 'high' ? 2 : 1,
          severity: item.severity,
        })),
        title: 'Risk Overview',
      },
    };
    
    await delay(300);
  }
  
  // Stream each risk item as a card
  if (analysis.riskHierarchy) {
    for (const risk of analysis.riskHierarchy) {
      yield {
        type: 'card',
        props: {
          severity: risk.severity,
          variant: risk.severity === 'high' ? 'danger' : 'warning',
        },
        children: [
          {
            type: 'text',
            props: {
              content: risk.ingredient,
              size: 'medium',
              weight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              content: risk.reason,
              size: 'small',
              weight: 'normal',
              color: 'muted',
            },
          },
        ],
      };
      
      // Stagger animation for smooth streaming effect
      await delay(200);
    }
  }
}

/**
 * Generate UI components for UNCERTAIN response
 */
async function* generateUncertainUI(
  analysis: AIResponse,
  complexity: ComplexityMetrics
): AsyncGenerator<UIComponent> {
  yield {
    type: 'card',
    props: {
      variant: 'neutral',
    },
    children: [
      {
        type: 'text',
        props: {
          content: '🤔 Uncertain Analysis',
          size: 'medium',
          weight: 'bold',
        },
      },
      {
        type: 'text',
        props: {
          content: analysis.rawText || 'Unable to analyze this product clearly.',
          size: 'small',
          weight: 'normal',
        },
      },
    ],
  };
}

/**
 * Delay helper for streaming animation
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main generative UI engine
 * Generates UI components dynamically based on analysis content and complexity
 */
export async function* generateUI(
  analysis: AIResponse,
  userProfile: UserProfile
): AsyncGenerator<UIComponent> {
  // Analyze product complexity
  const complexity = analyzeComplexity(analysis);
  
  // Generate UI based on response type
  switch (analysis.type) {
    case 'SAFE':
      yield* generateSafeUI(analysis, complexity);
      break;
      
    case 'RISK':
      yield* generateRiskUI(analysis, complexity);
      break;
      
    case 'UNCERTAIN':
      yield* generateUncertainUI(analysis, complexity);
      break;
      
    case 'CLARIFICATION':
      // Clarification UI handled by ClarificationCard component
      break;
  }
}

/**
 * Synchronous version for testing
 * Collects all UI components without streaming delays
 */
export async function generateUISync(
  analysis: AIResponse,
  userProfile: UserProfile
): Promise<UIComponent[]> {
  const components: UIComponent[] = [];
  
  for await (const component of generateUI(analysis, userProfile)) {
    components.push(component);
  }
  
  return components;
}
