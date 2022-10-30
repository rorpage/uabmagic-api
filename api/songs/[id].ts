import { VercelRequest, VercelResponse } from '@vercel/node';

import { buildCookieFromAuthHeader, login } from '../../utilities/authenticator';
import { getSong } from '../../utilities/song-fetcher';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const songId = vercelRequest.query.id as string;

  const authHeader = vercelRequest.headers.authorization || '';

  let cookies = '';
  let isAuthed = false;

  if (authHeader.length === 0) {
    const username = process.env.SEARCH_USERNAME || ``;
    const password = process.env.SEARCH_PASSWORD || ``;

    cookies = await login(username, password);
  } else {
    cookies = buildCookieFromAuthHeader(authHeader);
    isAuthed = true;
  }

  const song = await getSong(Number(songId), cookies, isAuthed);

  vercelResponse.json(song);
};
