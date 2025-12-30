import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Dependencies Installation', () => {
  it('should have ai package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('ai');
  });

  it('should have @ai-sdk/google package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('@ai-sdk/google');
  });

  it('should have clsx package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('clsx');
  });

  it('should have tailwind-merge package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('tailwind-merge');
  });

  it('should have framer-motion package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('framer-motion');
  });

  it('should have lucide-react package installed', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    expect(packageJson.dependencies).toHaveProperty('lucide-react');
  });
});
