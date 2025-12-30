import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for branding consistency
 * Validates: Requirements 9.1, 9.2
 * 
 * These tests ensure that the codebase contains no references to the old
 * "TruthPulse" branding and has been fully migrated to "Sach.ai"
 */

describe('Branding Consistency - Unit Tests', () => {
  // Helper function to recursively get all TypeScript and JavaScript files
  function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git, android, and other build directories
        if (!['node_modules', '.next', '.git', 'android', 'ios', '.kiro', 'dist', 'build'].includes(file)) {
          getAllSourceFiles(filePath, fileList);
        }
      } else if (
        file.endsWith('.ts') || 
        file.endsWith('.tsx') || 
        file.endsWith('.js') || 
        file.endsWith('.jsx') ||
        file.endsWith('.md') ||
        file.endsWith('.json')
      ) {
        // Exclude test files that check for absence of TruthPulse
        // Exclude build artifacts like tsconfig.tsbuildinfo
        if (!file.includes('.test.') && !file.includes('.tsbuildinfo')) {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }

  it('should contain no references to "TruthPulse" in the codebase', () => {
    const sourceFiles = getAllSourceFiles('.');
    const filesWithTruthPulse: string[] = [];
    
    sourceFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf-8');
        if (content.includes('TruthPulse')) {
          filesWithTruthPulse.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    expect(filesWithTruthPulse).toEqual([]);
  });

  it('should contain no references to "truthpulse" (lowercase) in the codebase', () => {
    const sourceFiles = getAllSourceFiles('.');
    const filesWithTruthpulse: string[] = [];
    
    sourceFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf-8');
        // Case-insensitive search for truthpulse
        if (content.toLowerCase().includes('truthpulse')) {
          filesWithTruthpulse.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    expect(filesWithTruthpulse).toEqual([]);
  });

  it('should use "Sach.ai" in metadata.json', () => {
    const metadata = JSON.parse(readFileSync('metadata.json', 'utf-8'));
    expect(metadata.name).toBe('Sach.ai');
  });

  it('should use "sachai" in package.json name', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    expect(packageJson.name).toBe('sachai');
  });

  it('should use "Sach.ai" in capacitor.config.json', () => {
    const capacitorConfig = JSON.parse(readFileSync('capacitor.config.json', 'utf-8'));
    expect(capacitorConfig.appName).toBe('Sach.ai');
  });

  it('should use "Sach.ai" in README.md title', () => {
    const readme = readFileSync('README.md', 'utf-8');
    expect(readme).toContain('# Sach.ai');
    expect(readme).not.toContain('TruthPulse');
    expect(readme).not.toContain('TruthLens');
  });
});
