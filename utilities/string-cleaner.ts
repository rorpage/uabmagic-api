export const cleanse = (input: string): string => {
  return input
    .replace(/\s\s+/g, ' ')
    .replace('( ', '(')
    .replace(' )', ')')
    .trim();
}
