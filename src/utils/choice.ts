import { warn } from 'lumilog';

import type { FlagValue } from '@/core/flag.js';

/**
 * Validates a flag value against allowed choices
 */
export function validateChoice(
  value: FlagValue,
  choices: any[],
  flagName: string,
  defaultValue?: FlagValue,
): FlagValue {
  if (!choices || choices.length === 0) return value;

  const stringValue = String(value);
  const choiceValues = choices.map((choice) => String(choice));

  if (!choiceValues.includes(stringValue)) {
    warn(
      `Invalid value for flag ${flagName}: ${value}. Allowed choices: ${choices.join(', ')}`,
    );
    return defaultValue ?? value;
  }

  return value;
}
