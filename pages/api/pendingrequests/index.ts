import Cheerio from 'cheerio';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { buildCookie, getUserIdAndSidFromHeader } from '../../../utilities/authenticator';
import { getSong } from '../../../utilities/song-fetcher';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  if (!vercelRequest.headers.authorization) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookie = buildCookie(vercelRequest.headers.authorization);

  if (vercelRequest.method === 'GET') {
    const requestResponse = await getPendingRequests(cookie);

    vercelResponse.json(requestResponse);
  } else if (vercelRequest.method === 'DELETE') {
    const { requestId, songId, username } = vercelRequest.body;
    const { userId } = getUserIdAndSidFromHeader(vercelRequest.headers.authorization);

    const requestResponse = await deletePendingRequest(userId, username, requestId, songId, cookie);

    vercelResponse.json(requestResponse);
  } else {
    vercelResponse.status(405).json({ error: 'Invalid method' });
  }
};

const getPendingRequests = async (cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch('http://uabmagic.com/UABpages/user_pending.php',
      {
        headers: {
          cookie: cookies
        }
      }
    )
    .then((res: Response) => res.text())
    .then(async (body: string) => {
      const $ = Cheerio.load(body);

      const inputs = $(`input[type="checkbox"]`);

      if (inputs.length === 0) return resolve({ results: [] });

      const results = await buildRequestList(inputs, cookies);

      return resolve({ results });
    });
  });
};

async function buildRequestList(inputs: cheerio.Cheerio, cookies: string) {
  const results: any[] = [];

  inputs.each((index: number, element: any) => {
    const attribs = element.attribs;

    const songId = Number(attribs.name.split('_')[1]);

    results.push({
      requestId: attribs.value,
      songId
    });
  });

  for await (const request of results) {
    const song = await getSong(request.songId, cookies);
    request.song = song;

    delete request.songId;
  }

  return results;
}

const deletePendingRequest = async (userId: Number, username: string,
  requestId: Number, songId: Number, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    const formData = `delete_${songId}=${requestId}` +
      `&idusername=${username}` +
      `&iduserid=${userId}`;

    fetch('http://uabmagic.com/UABpages/do-pending-requests.php',
      {
        body: formData,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          cookie: cookies
        }
      }
    )
    .then((res: Response) => res.text())
    .then(async (body: string) => {
      const success = body.indexOf('Deleting') !== -1;

      const pendingRequests = await getPendingRequests(cookies);

      return resolve({ success, pendingRequests });
    });
  });
};
