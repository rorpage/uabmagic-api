import { VercelRequest, VercelResponse } from '@vercel/node';

import * as nowPlayingFetcher from '../../../../utilities/now-playing-fetcher';

export default async (request: VercelRequest, response: VercelResponse) => {
  const authHeader = request.headers.authorization || '';

  const nowPlayingSong = await nowPlayingFetcher.getNowPlayingSong(authHeader);
  response.json(nowPlayingSong);
};
