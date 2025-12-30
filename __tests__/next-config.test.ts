import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Next.js Configuration for Capacitor', () => {
  it('should have images.unoptimized set to true in next.config.js', () => {
    const configPath = join(process.cwd(), 'next.config.js');
    const configContent = readFileSync(configPath, 'utf-8');
    
    // Check that the config file contains images.unoptimized: true
    expect(configContent).toContain('images');
    expect(configContent).toContain('unoptimized');
    expect(configContent).toMatch(/unoptimized\s*:\s*true/);
  });

  it('should export a valid Next.js config object', () => {
    // Dynamically require the config file
    const configPath = join(process.cwd(), 'next.config.js');
    
    // Clear the require cache to ensure fresh load
    delete require.cache[require.resolve(configPath)];
    
    const config = require(configPath);
    
    // Verify the config has the images.unoptimized property
    expect(config).toHaveProperty('images');
    expect(config.images).toHaveProperty('unoptimized');
    expect(config.images.unoptimized).toBe(true);
  });
});
