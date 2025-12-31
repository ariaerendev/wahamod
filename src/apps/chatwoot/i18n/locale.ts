import * as Mustache from 'mustache';
import * as lodash from 'lodash';
import { TemplatePayloads, TKey } from '@waha/apps/chatwoot/i18n/templates';
import Long from 'long';
import { ensureNumber } from '@waha/core/engines/noweb/utils';
import { EnsureMilliseconds } from '@waha/utils/timehelper';
import { TZ } from '@waha/apps/chatwoot/env';
import { isToday, isYesterday, isSameYear } from '@waha/utils/datehelper';

export class Locale {
  constructor(public readonly strings: Record<string, string>) {}

  /**
   * Return Base Locale
   * For number, datetime, currency formats
   */
  get locale(): string {
    return this.strings['locale.base'] || 'en';
  }

  key<K extends TKey>(key: K): Template<K> {
    return new Template(this.strings[key] || key);
  }

  r<K extends TKey | string>(key: K, data: TemplatePayloads[K] = null): string {
    const template = this.key(key as TKey);
    return template.render(data as any);
  }

  /**
   * Overrides the existing strings with the provided strings for the locale.
   * Merges the new strings with the current strings.
   */
  override(strings: Record<string, string>): Locale {
    return new Locale({ ...this.strings, ...strings });
  }

  FormatCurrency(
    currency: string,
    value: number | null,
    offset: number = 1,
  ): string | null {
    if (value == null) {
      return null;
    }
    if (!currency) {
      return null;
    }

    offset = offset || 1;
    try {
      const fmt = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: currency,
      });
      return fmt.format(value / offset);
    } catch (err) {
      return `${currency} ${value}`;
    }
  }

  FormatDatetime(date: Date | null, year): string | null {
    const options: any = lodash.clone(this.strings['datetime'] || {});
    return this.FormatDatetimeOpts(date, options, year);
  }

  ParseTimestamp(timestamp: Long | string | number | null): Date | null {
    const value = ensureNumber(timestamp);
    if (!value) {
      return undefined;
    }
    if (!Number.isFinite(value)) {
      return undefined;
    }
    const milliseconds = EnsureMilliseconds(value);
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  }

  FormatTimestamp(
    timestamp: Long | string | number | null,
    year: boolean = true,
  ): string | null {
    const date = this.ParseTimestamp(timestamp);
    return this.FormatDatetime(date, year);
  }

  /**
   * Format date using custom options
   */

  FormatDatetimeOpts(
    date: Date,
    options: Intl.DateTimeFormatOptions,
    year: boolean,
  ) {
    options = lodash.cloneDeep(options);
    if (!date) {
      return null;
    }
    const opts: any = this.strings['datetime'] || {};
    // Copy timezone if any
    options.timeZone = opts.timeZone || opts.timezone || TZ;
    if (!year && date.getFullYear() === new Date().getFullYear()) {
      // Hide year if current year
      options.year = undefined;
    }
    return date.toLocaleDateString(this.locale, options);
  }

  FormatTimestampOpts(
    timestamp: Long | string | number | null,
    options: Intl.DateTimeFormatOptions,
    year: boolean = true,
  ): string | null {
    const date = this.ParseTimestamp(timestamp);
    return this.FormatDatetimeOpts(date, options, year);
  }

  FormatHumanDate(date: Date): string {
    const options: any = lodash.clone(this.strings['datetime'] || {});
    const now = new Date();
    const today = isToday(date, now);
    const yesterday = isYesterday(date, now);
    const sameYear = isSameYear(date, now);
    const dateOptions: Intl.DateTimeFormatOptions = {
      ...options,
      hour: undefined,
      minute: undefined,
      second: undefined,
      timeZoneName: undefined,
      year: sameYear ? undefined : options.year,
      weekday: today || yesterday ? undefined : options.weekday,
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      ...options,
      year: undefined,
      month: undefined,
      day: undefined,
      weekday: undefined,
    };

    const dateStr = date.toLocaleDateString(this.locale, dateOptions);
    const timeStr = date.toLocaleTimeString(this.locale, timeOptions);

    if (today) {
      const todayLabel = this.r('Today');
      return `${todayLabel}, ${dateStr} • ${timeStr}`;
    }

    if (yesterday) {
      const yesterdayLabel = this.r('Yesterday');
      return `${yesterdayLabel}, ${dateStr} • ${timeStr}`;
    }

    // weekday already included in dateStr
    return `${dateStr} • ${timeStr}`;
  }
}

export class Template<K extends TKey> {
  constructor(private readonly template: string) {}

  render(data: TemplatePayloads[K]): string {
    const text = Mustache.render(this.template, data);
    // Remove /n at the end if any
    return text.replace(/\n$/, '');
  }

  r(data: TemplatePayloads[K]): string {
    return this.render(data);
  }
}
