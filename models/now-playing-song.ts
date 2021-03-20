import { Images } from './images';
import { Playback } from './playback';

export class NowPlayingSong {
  constructor() {
    this.images = new Images();
    this.playback = new Playback();
  }

  id: number;
  attractionAndSong: string;
  composer: string;
  images: Images;
  playback: Playback;
  plays: number;
  requestor: string;
  requests: number;
  schedule: string;
  themeParkAndLand: string;
  upNext: string[];
  year: number;
}
