import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Feature: generative-ui-streaming, Property 1: Type Safety Across Codebase
// Validates: Requirements 1.5, 11.3

describe('Property-Based Type Safety', () => {
  // Helper function to recursively get all TypeScript files
  function getAllTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, android, and other build directories
        if (!file.startsWith('.') && 
            file !== 'node_modules' && 
            file !== 'android' && 
            file !== 'dist' && 
            file !== 'build') {
          getAllTypeScriptFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  it('Property 1: For any TypeScript file in the codebase, the file should contain no explicit any types', () => {
    const rootDir = process.cwd();
    const tsFiles = getAllTypeScriptFiles(rootDir);
    
    // Filter out test files and scripts that may legitimately use any for mocking
    const productionFiles = tsFiles.filter(file => 
      !file.includes('__tests__') && 
      !file.includes('scripts/genai_') &&
      !file.includes('vitest.config.ts') &&
      !file.includes('next.config')
    );
    
    expect(productionFiles.length).toBeGreaterThan(0);
    
    const filesWithAny: Array<{ file: string; lines: string[] }> = [];
    
    productionFiles.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const problematicLines: string[] = [];
      
      lines.forEach((line, index) => {
        // Check for explicit any types (: any, as any, <any>, any[])
        // Exclude comments and type definitions that are intentionally generic
        if (!line.trim().startsWith('//') && 
            !line.trim().startsWith('*') &&
            !line.includes('// @ts-')) {
          
          // Match patterns like ": any", "as any", "<any>", "any[]", "any>"
          const anyPatterns = [
            /:\s*any\b/,           // : any
            /as\s+any\b/,          // as any
            /<any>/,               // <any>
            /any\[\]/,             // any[]
            /any>/,                // any>
            /\bany\s*\|/,          // any |
            /\|\s*any\b/,          // | any
          ];
          
          if (anyPatterns.some(pattern => pattern.test(line))) {
            problematicLines.push(`Line ${index + 1}: ${line.trim()}`);
          }
        }
      });
      
      if (problematicLines.length > 0) {
        filesWithAny.push({ file, lines: problematicLines });
      }
    });
    
    if (filesWithAny.length > 0) {
      const errorMessage = filesWithAny.map(({ file, lines }) => 
        `\n${file}:\n${lines.join('\n')}`
      ).join('\n');
      
      console.log('Files with any types:', errorMessage);
      expect(filesWithAny.length).toBe(0);
    }
  });

  it('Property 1: For any TypeScript file, strict type checking should be enabled', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    
    // Verify strict mode is enabled
    expect(tsconfig.compilerOptions?.strict).toBe(true);
  });

  it('Property 1: For any component file, props should be explicitly typed', () => {
    const rootDir = process.cwd();
    const componentFiles = getAllTypeScriptFiles(join(rootDir, 'components'));
    
    componentFiles.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      
      // Check for function components
      const functionComponentPattern = /export\s+(?:default\s+)?function\s+\w+\s*\(/;
      
      if (functionComponentPattern.test(content)) {
        // If it's a component, it should have typed props
        // Either through interface/type or inline typing
        const hasTypedProps = 
          content.includes('interface') || 
          content.includes('type ') ||
          content.includes('props:') ||
          content.includes('Props');
        
        // Allow components with no props (empty parentheses)
        const hasNoProps = /function\s+\w+\s*\(\s*\)/.test(content);
        
        if (!hasNoProps) {
          expect(hasTypedProps).toBe(true);
        }
      }
    });
  });
});
