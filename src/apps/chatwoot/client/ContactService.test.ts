import { sanitizeName } from '@waha/apps/chatwoot/client/ContactService';

describe('sanitizeName', () => {
  it('should return the same name', () => {
    const name = 'John Doe';
    expect(sanitizeName(name)).toBe(name);
  });
  it('should return 254 symbols max', () => {
    const name = 'a'.repeat(300);
    expect(sanitizeName(name)).toBe('a'.repeat(255));
  });

  it('should remove bidi characters and trim the name', () => {
    const name =
      '‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪‏‪+123123‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏‬‏';
    expect(sanitizeName(name)).toBe('+123123');
  });

  it('should not remove bidi characters if within limit', () => {
    const name = 'محمد +123';
    expect(sanitizeName(name)).toBe(name);
  });
});
