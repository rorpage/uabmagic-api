import { VercelRequest, VercelResponse } from '@vercel/node';

import * as nowPlayingFetcher from '../../../utilities/now-playing-fetcher';

export default async (request: VercelRequest, response: VercelResponse) => {
  const nowPlayingSong = await nowPlayingFetcher.getNowPlayingSong();

  const miniSong = {
    attractionAndSong: nowPlayingSong.attractionAndSong,
    themeParkAndLand: nowPlayingSong.themeParkAndLand,
    playback: nowPlayingSong.playback
  };

  response.json(miniSong);
};
