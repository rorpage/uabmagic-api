import { VercelRequest, VercelResponse } from '@vercel/node';

import { login } from '../../../utilities/authenticator';
import { getSong } from '../../../utilities/song-fetcher';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { songIds } = vercelRequest.body;

  const username = process.env.SEARCH_USERNAME || ``;
  const password = process.env.SEARCH_PASSWORD || ``;

  const cookies = await login(username, password);

  const promises = songIds.map(async (songId: Number) => {
    return await getSong(songId, cookies);
  });

  const results = await Promise.all(promises);

  vercelResponse.json({ results });
};
