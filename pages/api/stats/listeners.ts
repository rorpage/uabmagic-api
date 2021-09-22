import Cheerio from 'cheerio';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  fetch(`http://uabmagic.com/UABpages/user_votes_console.php`)
    .then(res => res.text())
    .then((body) => {
      const $ = Cheerio.load(body);

      const response: any = { listeners: {} };

      const data = $('center font');

      const premierElement = data[2] as any;
      const premier = Number(premierElement.firstChild?.data?.trim());
      response.listeners.premier = premier;

      const firstClassElement = data[4] as any;
      const firstClass = Number(firstClassElement.firstChild?.data?.trim());
      response.listeners.firstClass = firstClass;

      const economyElement = data[6] as any;
      const economy = Number(economyElement.firstChild?.data?.trim());
      response.listeners.economy = economy;

      response.listeners.total = premier + firstClass + economy;

      const allTimeElement = data[10] as any;
      response.listeners.allTime = Number(allTimeElement.firstChild?.data?.trim());

      vercelResponse.json(response);
    });
}
