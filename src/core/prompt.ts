/**
 * A promise that resolves to the user's input from the terminal.
 */
export type Prompt = Promise<string>;

/**
 * Prompts the user for input in the terminal and returns their response.
 *
 * Writes the provided message to stdout and waits for the user to type input.
 * Resolves with the input string, trimmed of leading and trailing whitespace.
 *
 * @param {string} [message='> '] - The prompt message to display in the terminal.
 * @returns {Promise<string>} A promise that resolves to the user's trimmed input.
 *
 * @example
 * (async () => {
 *   const name = await prompt("Enter your name: ");
 *   console.log(`Hello, ${name}!`);
 * })();
 */
export const prompt = async (message: string = '> '): Prompt => {
  process.stdout.write(message);
  return new Promise<string>((resolve) => {
    const onData = (data: Buffer) => {
      process.stdin.off('data', onData);
      resolve(data.toString().trim());
    };
    process.stdin.on('data', onData);
  });
};
