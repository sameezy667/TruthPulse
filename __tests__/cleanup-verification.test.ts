import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Cleanup Verification Tests', () => {
  describe('Package.json cleanup', () => {
    it('should not contain @google/generative-ai package', () => {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
      );
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      expect(allDeps).not.toHaveProperty('@google/generative-ai');
    });

    it('should not contain @google/genai package', () => {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
      );
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      expect(allDeps).not.toHaveProperty('@google/genai');
    });
  });

  describe('API route cleanup', () => {
    it('should not contain selectAvailableModel function', () => {
      const apiRouteContent = readFileSync(
        join(process.cwd(), 'app/api/analyze/route.ts'),
        'utf-8'
      );
      
      expect(apiRouteContent).not.toMatch(/function\s+selectAvailableModel/);
      expect(apiRouteContent).not.toMatch(/const\s+selectAvailableModel/);
      expect(apiRouteContent).not.toMatch(/selectAvailableModel\s*=/);
    });

    it('should not call generateContent', () => {
      const apiRouteContent = readFileSync(
        join(process.cwd(), 'app/api/analyze/route.ts'),
        'utf-8'
      );
      
      expect(apiRouteContent).not.toMatch(/\.generateContent\(/);
      expect(apiRouteContent).not.toMatch(/generateContent\(/);
    });

    it('should not contain manual JSON parsing regex (jsonMatch)', () => {
      const apiRouteContent = readFileSync(
        join(process.cwd(), 'app/api/analyze/route.ts'),
        'utf-8'
      );
      
      expect(apiRouteContent).not.toMatch(/jsonMatch/);
      expect(apiRouteContent).not.toMatch(/```json/);
      expect(apiRouteContent).not.toMatch(/JSON\.parse.*match/);
    });
  });
});
