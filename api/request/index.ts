import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { buildCookieFromAuthHeader } from '../../utilities/authenticator';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  if (!vercelRequest.headers.authorization) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const { songId } = vercelRequest.body;

  const cookie = buildCookieFromAuthHeader(vercelRequest.headers.authorization);

  const requestResponse = await request(songId, cookie);

  vercelResponse.json(requestResponse);
};

export const request = async (songId: number, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/req.php?songID=${songId}`,
      {
        headers: {
          Cookie: cookies
        }
      }
    )
      .then(res => res.text())
      .then(async (body: string) => {

        const $ = cheerio.load(body);
        const requestIDInputValue = $(`input[name="requestID"]`).attr(`value`);

        const requestId = Number(requestIDInputValue);
        const success = body.indexOf(`requested_icon.gif`) !== -1;

        let message = 'Song successfully requested!';

        if (!success) {
          if (body.indexOf(`Track already in queue to be played`) !== -1) {
            message = 'Track already in queue to be played';
          } else if (body.indexOf(`Track recently played`) !== -1) {
            message = 'Track recently played';
          } else if (body.indexOf(`Requests are disabled`) !== -1) {
            message = 'Requests are currently disabled';
          } else if (body.indexOf(`This track is a potential top ten weekly countdown candidate.`) !== -1) {
            message = 'Track is a potential Top Ten Weekly Countdown candidate';
          } else {
            message = 'An unknown error occurred';
          }
        }

        const apiResponse = {
          requestId,
          success,
          message
        };

        return resolve(apiResponse);
      });
  });
};
