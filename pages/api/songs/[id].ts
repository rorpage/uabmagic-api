import { VercelRequest, VercelResponse } from '@vercel/node';

import { login } from '../../../utilities/authenticator';
import { getSong } from '../../../utilities/song-fetcher';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const songId = vercelRequest.query.id as string;

  const username = process.env.SEARCH_USERNAME || ``;
  const password = process.env.SEARCH_PASSWORD || ``;

  const cookies = await login(username, password);

  const song = await getSong(Number(songId), cookies);

  vercelResponse.json(song);
};
