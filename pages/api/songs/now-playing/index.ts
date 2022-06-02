import { VercelRequest, VercelResponse } from '@vercel/node';
import * as nowPlayingFetcher from '../../../../utilities/now-playing-fetcher';

export default async (request: VercelRequest, response: VercelResponse) => {
  const nowPlayingSong = await nowPlayingFetcher.getNowPlayingSong();
  response.json(nowPlayingSong);
};
