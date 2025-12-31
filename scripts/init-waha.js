#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const forceIndex = args.indexOf('--force');
const forceOverwrite = forceIndex !== -1;

if (forceOverwrite) {
  args.splice(forceIndex, 1);
}

const folderArg = args[0] || '.';
const sourceArgRaw = args[1];
const targetArg = args[2] || '.env';

const envDir = path.resolve(process.cwd(), folderArg);
const sourceArg = sourceArgRaw || '.env.example';
const templateBaseDir = sourceArgRaw ? envDir : projectRoot;
const templatePath = path.isAbsolute(sourceArg)
  ? sourceArg
  : path.resolve(templateBaseDir, sourceArg);
const targetPath = path.isAbsolute(targetArg)
  ? targetArg
  : path.resolve(envDir, targetArg);

function exitWithMessage(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(envDir)) {
  exitWithMessage(`Target directory does not exist: ${envDir}`);
}

if (!fs.existsSync(templatePath)) {
  exitWithMessage(`Missing template file: ${templatePath}`);
}

if (!forceOverwrite && fs.existsSync(targetPath)) {
  const stats = fs.statSync(targetPath);
  if (stats.size > 0) {
    exitWithMessage(
      `${targetPath} already exists and is not empty. Remove it manually or rerun with --force to overwrite.`,
    );
  }
}

const exampleContent = fs.readFileSync(templatePath, 'utf8');

function generateSecret() {
  return crypto.randomUUID({ disableEntropyCache: true }).replace(/-/g, '');
}

const apiKey = generateSecret();
const adminPassword = generateSecret();

const updatedContent = exampleContent
  .replace(/^WAHA_API_KEY=.*/m, `WAHA_API_KEY=${apiKey}`)
  .replace(/^WAHA_API_KEY_PLAIN=.*/m, `WAHA_API_KEY_PLAIN=${apiKey}`)
  .replace(/^WAHA_DASHBOARD_USERNAME=.*/m, 'WAHA_DASHBOARD_USERNAME=admin')
  .replace(
    /^WAHA_DASHBOARD_PASSWORD=.*/m,
    `WAHA_DASHBOARD_PASSWORD=${adminPassword}`,
  )
  .replace(/^WHATSAPP_SWAGGER_USERNAME=.*/m, 'WHATSAPP_SWAGGER_USERNAME=admin')
  .replace(
    /^WHATSAPP_SWAGGER_PASSWORD=.*/m,
    `WHATSAPP_SWAGGER_PASSWORD=${adminPassword}`,
  );

fs.writeFileSync(targetPath, updatedContent, { encoding: 'utf8' });

const lines = [
  'Credentials generated.',
  '',
  'Dashboard and Swagger:',
  '  - Username: admin',
  `  - Password: ${adminPassword}`,
  '',
  'API key: ',
  `  - ${apiKey}`,
  '',
  'Use it in the Dashboard connection flow: https://waha.devlike.pro/docs/how-to/dashboard/#api-key',
];

console.log(lines.join('\n'));
