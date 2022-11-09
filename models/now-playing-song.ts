import { Images } from './images';
import { Playback } from './playback';

export class NowPlayingSong {
  constructor() {
    this.images = new Images();
    this.playback = new Playback();
  }

  id: number | undefined;
  attractionAndSong: string = '';
  composer: string = '';
  images: Images;
  isArtistBlock: boolean = false;
  isFavorite: boolean = false;
  isUabYourWayShow: boolean = false;
  isWeeklyCountdown: boolean = false;
  playback: Playback;
  plays: number | undefined;
  requestor: string = '';
  requests: number | undefined;
  schedule: string = '';
  themeParkAndLand: string = '';
  uabYourWayUser: string = '';
  upNext: string[] | undefined;
  year: number | undefined;
}
