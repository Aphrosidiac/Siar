/** A tiny argv parser: --flag value, --flag=value, boolean flags, repeatable flags, positionals. */

export type FlagType = 'string' | 'boolean' | 'number' | 'multi';
export type FlagSpec = Record<string, FlagType>;
export type Flags = Record<string, string | boolean | number | string[] | undefined>;

export class UsageError extends Error {
  override readonly name = 'UsageError';
}

export function parseArgs(argv: string[], spec: FlagSpec): { flags: Flags; positionals: string[] } {
  const flags: Flags = {};
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { positionals.push(...argv.slice(i + 1)); break; }
    if (!a.startsWith('--') || a === '-') {
      if (a.startsWith('-') && a.length === 2 && a !== '-') {
        if (a === '-h') { flags.help = true; continue; }
        throw new UsageError(`Unknown option ${a}. Options use two dashes, e.g. --team.`);
      }
      positionals.push(a);
      continue;
    }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    let inline: string | undefined = eq === -1 ? undefined : a.slice(eq + 1);
    const type = spec[name];
    if (!type && name.startsWith('no-') && spec[name.slice(3)] === 'boolean') {
      flags[name.slice(3)] = false;
      continue;
    }
    if (!type) throw new UsageError(`Unknown option --${name}.`);
    if (type === 'boolean') {
      if (inline === undefined) flags[name] = true;
      else if (/^(true|1|yes)$/i.test(inline)) flags[name] = true;
      else if (/^(false|0|no)$/i.test(inline)) flags[name] = false;
      else throw new UsageError(`--${name} is a switch; got "${inline}".`);
      continue;
    }
    if (inline === undefined) {
      const next = argv[i + 1];
      if (next === undefined || (next.startsWith('--') && next.length > 2)) throw new UsageError(`--${name} needs a value.`);
      inline = next;
      i++;
    }
    if (type === 'number') {
      const n = Number(inline);
      if (!Number.isFinite(n)) throw new UsageError(`--${name} must be a number; got "${inline}".`);
      flags[name] = n;
    } else if (type === 'multi') {
      flags[name] = [...((flags[name] as string[] | undefined) ?? []), inline];
    } else {
      if (flags[name] !== undefined) throw new UsageError(`--${name} given twice.`);
      flags[name] = inline;
    }
  }
  return { flags, positionals };
}
