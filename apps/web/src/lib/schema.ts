import type { JsonSchema } from 'virtual:post-schema';

export type FieldKind = 'enum' | 'boolean' | 'string' | 'number' | 'list' | 'datetime' | 'json';
export function kindOf(s: JsonSchema): FieldKind {
  const t = Array.isArray(s.type) ? s.type.find((x) => x !== 'null') : s.type;
  if (s.enum) return 'enum';
  if (t === 'boolean') return 'boolean';
  if (t === 'integer' || t === 'number') return 'number';
  if (t === 'string') return s.format === 'date-time' ? 'datetime' : 'string';
  if (t === 'array' && s.items && s.items.type === 'string' && !s.items.enum) return 'list';
  return 'json';
}
