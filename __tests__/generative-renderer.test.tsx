import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('GenerativeRenderer Routing', () => {
  const componentPath = join(process.cwd(), 'components/results/GenerativeRenderer.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should import ReasoningTerminal component', () => {
    expect(componentContent).toContain("import ReasoningTerminal from '@/components/processing/ReasoningTerminal'");
  });

  it('should import SafeCard component', () => {
    expect(componentContent).toContain("import SafeCard from './SafeCard'");
  });

  it('should import RiskHierarchy component', () => {
    expect(componentContent).toContain("import RiskHierarchy from './RiskHierarchy'");
  });

  it('should import DecisionFork component', () => {
    expect(componentContent).toContain("import DecisionFork from './DecisionFork'");
  });

  it('should import UncertainCard component', () => {
    expect(componentContent).toContain("import UncertainCard from './UncertainCard'");
  });

  it('should accept DeepPartial<AIResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<AIResponse>');
  });

  it('should accept onReset prop', () => {
    expect(componentContent).toContain('onReset: () => void');
  });

  it('should accept optional onDecision prop', () => {
    expect(componentContent).toContain('onDecision?: (choice: \'Strict\' | \'Flexible\') => void');
  });

  it('should render ReasoningTerminal when type is undefined', () => {
    expect(componentContent).toContain('if (!data?.type)');
    expect(componentContent).toContain('return <ReasoningTerminal');
  });

  it('should have switch statement on data.type', () => {
    expect(componentContent).toContain('switch (data.type)');
  });

  it('should render SafeCard when type is SAFE', () => {
    expect(componentContent).toContain("case 'SAFE':");
    expect(componentContent).toContain('return <SafeCard');
  });

  it('should render RiskHierarchy when type is RISK', () => {
    expect(componentContent).toContain("case 'RISK':");
    expect(componentContent).toContain('return <RiskHierarchy');
  });

  it('should render DecisionFork when type is DECISION', () => {
    expect(componentContent).toContain("case 'DECISION':");
    expect(componentContent).toContain('<DecisionFork');
  });

  it('should render UncertainCard when type is UNCERTAIN', () => {
    expect(componentContent).toContain("case 'UNCERTAIN':");
    expect(componentContent).toContain('return <UncertainCard');
  });

  it('should have default case that renders ReasoningTerminal', () => {
    expect(componentContent).toContain('default:');
    // Check that default case returns ReasoningTerminal
    const defaultCaseMatch = componentContent.match(/default:\s*return <ReasoningTerminal/);
    expect(defaultCaseMatch).toBeTruthy();
  });

  it('should pass onReset to SafeCard', () => {
    const safeCardMatch = componentContent.match(/<SafeCard[^>]*onReset={onReset}/);
    expect(safeCardMatch).toBeTruthy();
  });

  it('should pass onReset to RiskHierarchy', () => {
    const riskHierarchyMatch = componentContent.match(/<RiskHierarchy[^>]*onReset={onReset}/);
    expect(riskHierarchyMatch).toBeTruthy();
  });

  it('should pass onReset to DecisionFork', () => {
    // DecisionFork is on multiple lines, so check for the prop separately
    const hasDecisionFork = componentContent.includes('<DecisionFork');
    const hasOnReset = componentContent.includes('onReset={onReset}');
    expect(hasDecisionFork && hasOnReset).toBeTruthy();
  });

  it('should pass onReset to UncertainCard', () => {
    const uncertainCardMatch = componentContent.match(/<UncertainCard[^>]*onReset={onReset}/);
    expect(uncertainCardMatch).toBeTruthy();
  });

  it('should pass onDecision to DecisionFork', () => {
    const decisionForkMatch = componentContent.match(/<DecisionFork[^>]*onDecision=/);
    expect(decisionForkMatch).toBeTruthy();
  });

  it('should export GenerativeRenderer as default', () => {
    expect(componentContent).toContain('export default function GenerativeRenderer');
  });
});
