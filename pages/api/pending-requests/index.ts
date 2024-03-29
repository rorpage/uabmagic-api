import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { buildCookieFromAuthHeader, getUserIdAndSidFromHeader } from '../../../utilities/authenticator';
import { getSong } from '../../../utilities/song-fetcher';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  if (!vercelRequest.headers.authorization) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookie = buildCookieFromAuthHeader(vercelRequest.headers.authorization);

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
      .then(res => res.text())
      .then(async (response) => {
        const $ = cheerio.load(response);

        const inputs = $(`input[type="checkbox"]`);

        if (inputs.length === 0) return resolve({ results: [] });

        const results = await buildRequestList(inputs, cookies);

        return resolve({ results });
      });
  });
};

async function buildRequestList(inputs: cheerio.Cheerio<cheerio.Element>, cookies: string) {
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
    const params = new URLSearchParams(
      [
        ['idusername', username],
        ['iduserid', userId.toString()],
        [`delete_${songId}`, requestId.toString()]
      ]
    );

    fetch(
      'http://uabmagic.com/UABpages/do-pending-requests.php',
      {
        body: params,
        headers: {
          cookie: cookies
        },
        method: 'POST'
      })
      .then(res => res.text())
      .then(async (result) => {
        const success = result.indexOf('Deleting') !== -1;

        const pendingRequests = await getPendingRequests(cookies);

        return resolve({ success, pendingRequests });
      });
  });
};
