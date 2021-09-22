import Cheerio from 'cheerio';
import { buildCookie } from '../../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  if (!vercelRequest.headers.authorization) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const { songId } = vercelRequest.body;

  const cookie = buildCookie(vercelRequest.headers.authorization);

  const requestResponse = await request(songId, cookie);

  vercelResponse.json(requestResponse);
};

export const request = async (songId: number, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/req.php?songID=${songId}`,
      {
        headers: {
          cookie: cookies
        }
      }
    )
    .then(res => res.text())
    .then((body) => {
      const $ = Cheerio.load(body);
      const requestIDInputValue = $(`input[name="requestID"]`).attr(`value`);

      const requestId = Number(requestIDInputValue);
      const success = body.indexOf(`requested_icon.gif`) !== -1;

      const response = {
        requestId,
        success
      };

      return resolve(response);
    });
  });
};
