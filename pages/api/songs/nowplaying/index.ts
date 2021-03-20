import { NowRequest, NowResponse } from '@now/node';
import * as nowPlayingFetcher from '../../../../utilities/now-playing-fetcher';

export default async (nowRequest: NowRequest, nowResponse: NowResponse) => {
  const nowPlayingSong = await nowPlayingFetcher.getNowPlayingSong();
  nowResponse.json(nowPlayingSong);
};
