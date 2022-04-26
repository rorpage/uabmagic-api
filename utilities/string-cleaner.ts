export const cleanse = (input: string): string => {
  return input
    .replace(/\s\s+/g, ' ')
    .replace('( ', '(')
    .replace(' )', ')')
    // Typos
    .replace('Pavillion', 'Pavilion')
    .trim();
}
