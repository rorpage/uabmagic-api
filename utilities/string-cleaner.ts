import { titleCase } from "title-case";

export const cleanse = (input: string, fixCase = true): string => {
  let cleanInput =
    input
      .trim()
      .replace(/\s\s+/g, ' ')
      .replace('( ', '(')
      .replace(' )', ')')
      .trim();

  if (fixCase) {
    cleanInput = titleCase(cleanInput);
  }

  return cleanInput
    // Typos
    .replace('Pavillion', 'Pavilion')
    .replace('Forcourt', 'Forecourt')
    .replace(' And ', ' and ')
    .replace(' Or ', ' or ')
    .replace('South.', 'South')
    .replace("It's a Small World", `"it's a small world"`)
    .replace('1 Requests', '1 Request')
    .replace('1 requests', '1 request')
    .trim();
}

export const cleanSchedule = (input: string): string => {
  return cleanse(input, false)
    .replace('Regular Schedule - Normal rotation and listener requests', 'Regular Schedule - Normal Rotation and Listener Requests')
    .replace('Now playing: ', '')
    .replace('Now Playing: ', '')
    .replace(' - - ', ' - ')
    .replace('the Artists Block', 'The Artists Block')
    .replace(':', '')
    .trim();
}
