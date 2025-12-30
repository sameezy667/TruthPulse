#!/usr/bin/env node

/**
 * Switch between dev and production Capacitor configs
 * Usage:
 *   node scripts/switch-config.js dev
 *   node scripts/switch-config.js prod
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2];

if (!mode || !['dev', 'prod'].includes(mode)) {
  console.error('Usage: node scripts/switch-config.js [dev|prod]');
  process.exit(1);
}

const sourceFile = path.join(__dirname, '..', `capacitor.config.${mode}.json`);
const targetFile = path.join(__dirname, '..', 'capacitor.config.json');

if (!fs.existsSync(sourceFile)) {
  console.error(`Config file not found: ${sourceFile}`);
  process.exit(1);
}

fs.copyFileSync(sourceFile, targetFile);
console.log(`✅ Switched to ${mode} config`);

if (mode === 'prod') {
  const config = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  if (config.server?.url?.includes('YOUR-APP')) {
    console.warn('\n⚠️  WARNING: Update capacitor.config.prod.json with your Vercel URL!');
  }
}
