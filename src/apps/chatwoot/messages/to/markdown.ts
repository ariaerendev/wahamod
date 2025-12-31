const DEFAULT_PLACEHOLDER_PREFIX = 'URLPLACEHOLDER';
const URL_REGEX = /https?:\/\/[^\s]+/g;

export class UrlProtection {
  /** Replaces URLs with placeholders so downstream formatters don't touch them. */
  constructor(
    private readonly placeholder: string = DEFAULT_PLACEHOLDER_PREFIX,
  ) {}

  protect(text: string): ProtectedUrlText {
    const urls: string[] = [];
    const result = text.replace(URL_REGEX, (url) => {
      const index = urls.length;
      urls.push(url);
      return `${this.placeholder}${index}`;
    });

    return new ProtectedUrlText(result, urls, this.placeholder);
  }
}

export class ProtectedUrlText {
  /** Carries protected text and restores URLs back into place. */
  constructor(
    public text: string,
    private readonly urls: string[],
    private readonly placeholder: string,
  ) {}

  restore(text: string = this.text): string {
    return this.urls.reduce((acc, url, index) => {
      const placeholder = `${this.placeholder}${index}`;
      return acc.replace(placeholder, url);
    }, text);
  }
}
