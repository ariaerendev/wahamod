import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';

export class I18N {
  private readonly locales: Record<string, Locale>;

  constructor() {
    this.locales = {};
  }

  available(): Array<{ name: string; locale: string }> {
    const result = [];
    for (const [key, template] of Object.entries(this.locales)) {
      result.push({ locale: key, name: template.key(TKey.LOCALE_NAME).r() });
    }
    return result;
  }

  load(locales: Record<string, Record<string, string>>) {
    for (const [locale, strings] of Object.entries(locales)) {
      this.add(locale, strings);
    }
  }

  add(locale: string, strings: Record<string, string>) {
    if (!this.locales[locale]) {
      this.locales[locale] = new Locale(strings);
    } else {
      this.locales[locale] = this.locales[locale].override(strings);
    }
  }

  locale(locale: string) {
    if (!this.has(locale)) {
      throw new Error(`Locale ${locale} not found`);
    }
    return this.locales[locale];
  }

  has(locale: string) {
    return !!this.locales[locale];
  }
}
