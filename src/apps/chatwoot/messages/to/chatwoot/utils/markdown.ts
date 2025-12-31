import { UrlProtection } from '@waha/apps/chatwoot/messages/to/markdown';

const boldPattern = new RegExp(
  `(?<![\\p{L}\\p{N}_*])\\*(?!\\*)(?=\\S)(.+?)(?<=\\S)\\*(?![\\p{L}\\p{N}_*])`,
  'gu',
);
const italicPattern = new RegExp(
  `(?<![\\p{L}\\p{N}_])_(?!_)(?=\\S)(.+?)(?<=\\S)_(?![\\p{L}\\p{N}_])`,
  'gu',
);
const strikePattern = new RegExp(
  `(?<![\\p{L}\\p{N}_~])~(?!~)(?=\\S)(.+?)(?<=\\S)~(?![\\p{L}\\p{N}_~])`,
  'gu',
);

export function WhatsappToMarkdown(text: string): string {
  if (!text) {
    return text;
  }
  if (text == '') {
    return '';
  }

  // Extract and protect URLs before formatting transformations
  const protection = new UrlProtection();
  const urls = protection.protect(text);
  text = urls.text;

  // Apply markdown transformations to "clean" text
  let result = text
    // Bold: *bold* → **bold**
    .replace(boldPattern, '**$1**')
    // Strikethrough: ~strike~ → ~~strike~~
    .replace(strikePattern, '~~$1~~')
    // Italic: _italic_ → *italic*
    .replace(italicPattern, '*$1*');

  // Restore original URLs after all transformations
  result = urls.restore(result);
  return result;
}
