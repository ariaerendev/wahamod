import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'yaml';

export class YamlLocaleLoader {
  constructor(
    private readonly dir: string,
    private readonly ext: string,
  ) {}

  load(): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    const files = fs.readdirSync(this.dir, { withFileTypes: true });
    for (const entry of files) {
      if (!entry.isFile()) continue;

      const filename = entry.name;
      if (!filename.endsWith(`.${this.ext}`)) continue;

      const locale = path.basename(filename, `.${this.ext}`);
      const filePath = path.join(this.dir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');

      const parsed = yaml.parse(content) as Record<string, string> | undefined;
      if (parsed && typeof parsed === 'object') {
        result[locale] = parsed as Record<string, string>;
      }
    }

    return result;
  }
}
