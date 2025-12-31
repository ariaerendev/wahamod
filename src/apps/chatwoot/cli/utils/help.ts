import { Command, Help, Option } from 'commander';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';

export function fullCommandPath(sub: Command): string {
  const parts: string[] = [];
  let cmd: Command | null = sub;
  // collect names up to (but not including) the root program
  const name = cmd.name();
  if (name) parts.push(name);
  while (cmd && cmd.parent) {
    cmd = cmd.parent!;
    const name = cmd.name();
    if (name && name != 'program') parts.push(name);
  }
  return parts.reverse().join(' ');
}

export function buildFormatHelp(l: Locale) {
  /**
   * Commands first, then Arguments, then Options
   * @param cmd
   * @param helper
   */

  return function formatHelp(this: Help, cmd: Command, helper: Help) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80;

    const callFormatItem = (term: string, description: string) =>
      helper.formatItem(term, termWidth, description, helper);
    let output: string[] = [];

    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([
        helper.boxWrap(
          helper.styleCommandDescription(commandDescription),
          helpWidth,
        ),
        '',
      ]);
    }

    const usage = helper.commandUsage(cmd);
    if (usage) {
      output.push(
        `${
          helper.styleTitle(l.r('cli.help.usage.title')) + '\n'
        } ${helper.styleUsage(helper.commandUsage(cmd))}`,
      );
      output.push('');
    }

    const commandGroups = this.groupItems(
      cmd.commands as Command[],
      helper.visibleCommands(cmd),
      (sub) => sub.helpGroup() || l.r('cli.help.commands.defaultGroup'),
    );
    commandGroups.forEach((commands, group) => {
      if (!commands.length) {
        return;
      }

      const commandLines = commands.map((sub) => {
        const commandTerm = helper.styleSubcommandTerm(
          helper.subcommandTerm(sub),
        );
        const description = helper.subcommandDescription(sub);
        const styledDescription = description
          ? helper.styleSubcommandDescription(description)
          : '';
        return `${commandTerm} ${styledDescription}`;
      });

      output.push(helper.styleTitle(group));
      output.push(...commandLines);
      output.push('');
    });

    const argumentList = helper
      .visibleArguments(cmd)
      .map((argument) =>
        callFormatItem(
          helper.styleArgumentTerm(helper.argumentTerm(argument)),
          helper.styleArgumentDescription(helper.argumentDescription(argument)),
        ),
      );
    output = output.concat(
      this.formatItemList(
        l.r('cli.help.arguments.title'),
        argumentList,
        helper,
      ),
    );

    const optionGroups = this.groupItems(
      cmd.options as Option[],
      helper.visibleOptions(cmd),
      (option) =>
        option.helpGroupHeading ?? l.r('cli.help.options.defaultGroup'),
    );
    optionGroups.forEach((options, group) => {
      const optionList = options.map((option) =>
        callFormatItem(
          helper.styleOptionTerm(helper.optionTerm(option)),
          helper.styleOptionDescription(helper.optionDescription(option)),
        ),
      );
      output = output.concat(this.formatItemList(group, optionList, helper));
    });

    if (helper.showGlobalOptions) {
      const globalOptionList = helper
        .visibleGlobalOptions(cmd)
        .map((option) =>
          callFormatItem(
            helper.styleOptionTerm(helper.optionTerm(option)),
            helper.styleOptionDescription(helper.optionDescription(option)),
          ),
        );
      output = output.concat(
        this.formatItemList(
          l.r('cli.help.globalOptions.title'),
          globalOptionList,
          helper,
        ),
      );
    }

    return output.join('\n');
  };
}
