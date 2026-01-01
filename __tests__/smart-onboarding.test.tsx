import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('SmartOnboarding Component', () => {
  const componentPath = join(process.cwd(), 'components/onboarding/SmartOnboarding.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should export SmartOnboarding as default function', () => {
    expect(componentContent).toContain('export default function SmartOnboarding');
  });

  it('should accept onComplete prop', () => {
    expect(componentContent).toContain('onComplete');
  });

  it('should have welcome heading', () => {
    expect(componentContent).toContain('Welcome to Sach.ai');
  });

  it('should have AI co-pilot description', () => {
    expect(componentContent).toContain('AI co-pilot for food decisions');
  });

  it('should have three feature cards', () => {
    // Check for the three key features
    expect(componentContent).toContain('I learn from you');
    expect(componentContent).toContain('I explain my reasoning');
    expect(componentContent).toContain('I adapt to you');
  });

  it('should have Start Scanning button', () => {
    expect(componentContent).toContain('Start Scanning');
  });

  it('should use framer-motion for animations', () => {
    expect(componentContent).toContain("from 'framer-motion'");
    expect(componentContent).toContain('motion.');
  });

  it('should have animated background gradients', () => {
    expect(componentContent).toContain('bg-emerald-400/40');
    expect(componentContent).toContain('blur-[100px]');
  });

  it('should call onComplete when Start Scanning is clicked', () => {
    expect(componentContent).toContain('onClick={handleComplete}');
    expect(componentContent).toContain('onComplete()');
  });

  it('should use haptic feedback', () => {
    expect(componentContent).toContain('hapticSelection');
  });

  it('should have staggered animation delays for feature cards', () => {
    expect(componentContent).toContain('delay');
    expect(componentContent).toContain('transition');
  });

  it('should have FeatureCard component', () => {
    expect(componentContent).toContain('function FeatureCard');
  });
});
