#!/usr/bin/env node
const { readFileSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const YAML = require('yaml');

const repoRoot = path.resolve(__dirname, '..');
const enPath = path.join(repoRoot, 'src/apps/chatwoot/i18n/locales/en-US.yaml');
const contents = readFileSync(enPath, 'utf8');
const document = YAML.parse(contents);

const flatten = (node, prefix = '') => {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    return Object.entries(node).reduce((acc, [key, value]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return acc.concat(flatten(value, next));
    }, []);
  }

  return [prefix];
};

const allKeys = flatten(document).filter(Boolean);

const ignoredPrefixes = ['datetime.', 'locale.'];

const ignored = new Set();
const unused = [];

const searchRoots = ['src', 'tests'];

for (const key of allKeys) {
  if (
    ignoredPrefixes.some((prefix) => key.startsWith(prefix)) ||
    !key.includes('.')
  ) {
    ignored.add(key);
    continue;
  }

  const result = spawnSync(
    'rg',
    [
      '--files-with-matches',
      '--fixed-strings',
      key,
      ...searchRoots,
      '--glob',
      '!apps/chatwoot/i18n/locales/*.yaml',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  );

  if (result.status !== 0 || !result.stdout.trim()) {
    unused.push(key);
  }
}

const message = [
  `Scanned ${allKeys.length} keys.`,
  `Ignored ${ignored.size} keys (datetime.*, locale.*, or without dot).`,
  unused.length
    ? `Found ${unused.length} potentially unused keys:\n - ${unused.join(
        '\n - ',
      )}`
    : 'No unused keys detected.',
];

console.log(message.join('\n'));
