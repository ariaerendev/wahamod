import { WhatsappToMarkdown } from './markdown';

describe('WhatsappToMarkdown', () => {
  it('converts asterisks to bold', () => {
    const input = '*bold*';
    expect(WhatsappToMarkdown(input)).toBe('**bold**');
  });
  it('converts underscores to italic', () => {
    const input = '_italic_';
    expect(WhatsappToMarkdown(input)).toBe('*italic*');
  });
  it('handles multiple transformations at once', () => {
    const input = `*bold* | _italic_ | ~strike~ | \`one line code\` | \`\`\`\nmultiple lines\`\`\` `;
    const expected = `**bold** | *italic* | ~~strike~~ | \`one line code\` | \`\`\`\nmultiple lines\`\`\` `;
    expect(WhatsappToMarkdown(input)).toBe(expected);
  });

  // Tests for URL protection
  it('preserves URLs with single underscore', () => {
    const input = 'https://example.com/page_name';
    expect(WhatsappToMarkdown(input)).toBe('https://example.com/page_name');
  });

  it('preserves URLs with double underscores', () => {
    const input = 'https://en.wikipedia.org/wiki/Sarah_Jessica_Parker';
    expect(WhatsappToMarkdown(input)).toBe(
      'https://en.wikipedia.org/wiki/Sarah_Jessica_Parker',
    );
  });

  it('preserves URLs with multiple underscores', () => {
    const input = 'https://example.com/a_b_c_test';
    expect(WhatsappToMarkdown(input)).toBe('https://example.com/a_b_c_test');
  });

  it('handles mixed text with URLs and formatting', () => {
    const input = 'Veja *isso* em https://example.com/test_link e _aquilo_';
    const expected =
      'Veja **isso** em https://example.com/test_link e *aquilo*';
    expect(WhatsappToMarkdown(input)).toBe(expected);
  });

  it('handles multiple URLs in same text', () => {
    const input =
      'Links: https://example.com/page_1 e https://example.com/page_2';
    expect(WhatsappToMarkdown(input)).toBe(
      'Links: https://example.com/page_1 e https://example.com/page_2',
    );
  });

  it('handles URLs with underscores and regular italic formatting', () => {
    const input = 'URL: https://example.com/test_page e texto _em itálico_';
    const expected = 'URL: https://example.com/test_page e texto *em itálico*';
    expect(WhatsappToMarkdown(input)).toBe(expected);
  });

  it('keeps already bold markdown intact', () => {
    const input = '**PIX - Copia e Cola**';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });

  it('keeps already strikethrough markdown intact', () => {
    const input = '~~removed~~';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });

  it('keeps underscores inside identifiers intact', () => {
    const input = 'api key: abc_test_key';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });

  it('does not convert underscores inside words', () => {
    const input = 'Instance name: customer_prod_instance';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });

  it('does not convert when markers are stuck to word characters', () => {
    const input = 'My name is*Rafael* and email is test_user@example.com';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });

  it('keeps formatting when markers touch punctuation boundaries', () => {
    const input = 'Hello *Rafael*, welcome to _WAHA_!';
    const expected = 'Hello **Rafael**, welcome to *WAHA*!';
    expect(WhatsappToMarkdown(input)).toBe(expected);
  });

  it('ignores markers with inner spaces next to the marker', () => {
    const input = '* text* and _ text_ should stay the same';
    expect(WhatsappToMarkdown(input)).toBe(input);
  });
});
