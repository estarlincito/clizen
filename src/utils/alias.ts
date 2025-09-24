/**
 * Represents an alias configuration.
 */
export type Alias = {
  value: string[];
};

/**
 * Type for alias input: single string or array of strings.
 */
export type Aliases = string | string[];

/**
 * Normalizes aliases to an Alias object.
 * @param aliases - Single alias or array of aliases.
 * @returns An Alias object with normalized values.
 */
export const alias = (aliases: Aliases): Alias => ({
  value: Array.isArray(aliases) ? aliases : [aliases],
});
