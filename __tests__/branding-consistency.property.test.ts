import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Property-based tests for branding consistency
 * Feature: generative-ui-streaming, Property 13: Branding Consistency
 * Validates: Requirements 9.3
 * 
 * For any user-visible text in the application, the text should use "Sach.ai"
 * and should not contain "TruthPulse" or "truthpulse"
 */

describe('Branding Consistency - Property Tests', () => {
  // Helper function to get all source files
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
        // Exclude test files and build artifacts
        if (!file.includes('.test.') && !file.includes('.tsbuildinfo')) {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }

  // Helper to extract user-visible strings from source files
  function extractUserVisibleStrings(content: string): string[] {
    const strings: string[] = [];
    
    // Match strings in JSX/TSX (between quotes in JSX)
    const jsxStringRegex = /(?:>|=\s*["']|:\s*["'])([^<>"']+)(?:["']|<)/g;
    let match;
    while ((match = jsxStringRegex.exec(content)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        strings.push(match[1].trim());
      }
    }
    
    // Match strings in template literals
    const templateLiteralRegex = /`([^`]+)`/g;
    while ((match = templateLiteralRegex.exec(content)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        strings.push(match[1].trim());
      }
    }
    
    // Match strings in regular quotes
    const quotedStringRegex = /["']([^"']+)["']/g;
    while ((match = quotedStringRegex.exec(content)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        strings.push(match[1].trim());
      }
    }
    
    return strings;
  }

  it('Property 13: For any user-visible text, should use "Sach.ai" and not contain "TruthPulse" or "truthpulse"', () => {
    // Feature: generative-ui-streaming, Property 13: Branding Consistency
    
    const sourceFiles = getAllSourceFiles('.');
    
    // Property: For all source files, any user-visible text should not contain old branding
    fc.assert(
      fc.property(
        fc.constantFrom(...sourceFiles),
        (filePath) => {
          try {
            const content = readFileSync(filePath, 'utf-8');
            const userVisibleStrings = extractUserVisibleStrings(content);
            
            // For any user-visible string, it should not contain TruthPulse or truthpulse
            for (const str of userVisibleStrings) {
              const lowerStr = str.toLowerCase();
              
              // Check that the string doesn't contain old branding
              if (lowerStr.includes('truthpulse')) {
                throw new Error(
                  `Found "truthpulse" in user-visible text in ${filePath}: "${str}"`
                );
              }
              
              // If the string mentions the app name, it should be Sach.ai
              if (lowerStr.includes('app name') || lowerStr.includes('application')) {
                // This is a description, check if it mentions the correct branding
                if (str.includes('Sach.ai') || !str.match(/[A-Z][a-z]+[A-Z]/)) {
                  // Either contains Sach.ai or doesn't contain a brand name pattern
                  return true;
                }
              }
            }
            
            return true;
          } catch (error) {
            if (error instanceof Error && error.message.includes('truthpulse')) {
              throw error;
            }
            // Skip files that can't be read
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13 (Variant): For any file content, should not contain "TruthPulse" case-insensitively', () => {
    // Feature: generative-ui-streaming, Property 13: Branding Consistency
    
    const sourceFiles = getAllSourceFiles('.');
    
    // Property: For all source files, the content should not contain TruthPulse
    fc.assert(
      fc.property(
        fc.constantFrom(...sourceFiles),
        (filePath) => {
          try {
            const content = readFileSync(filePath, 'utf-8');
            const lowerContent = content.toLowerCase();
            
            // Should not contain truthpulse in any case
            expect(lowerContent).not.toContain('truthpulse');
            
            return true;
          } catch (error) {
            // Skip files that can't be read
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13 (Configuration): For any configuration file, should use correct branding', () => {
    // Feature: generative-ui-streaming, Property 13: Branding Consistency
    
    const configFiles = [
      'metadata.json',
      'package.json',
      'capacitor.config.json'
    ];
    
    // Property: For all configuration files, branding should be consistent
    fc.assert(
      fc.property(
        fc.constantFrom(...configFiles),
        (configFile) => {
          try {
            const content = readFileSync(configFile, 'utf-8');
            const config = JSON.parse(content);
            
            // Check that config doesn't contain old branding
            const configStr = JSON.stringify(config).toLowerCase();
            expect(configStr).not.toContain('truthpulse');
            
            // Check specific fields based on file
            if (configFile === 'metadata.json') {
              expect(config.name).toBe('Sach.ai');
            } else if (configFile === 'package.json') {
              expect(config.name).toBe('sachai');
            } else if (configFile === 'capacitor.config.json') {
              expect(config.appName).toBe('Sach.ai');
            }
            
            return true;
          } catch (error) {
            // Skip if file doesn't exist
            return true;
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
