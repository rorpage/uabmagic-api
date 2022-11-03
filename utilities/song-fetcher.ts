import * as cheerio from 'cheerio';
import { cleanse } from './string-cleaner';
import { Constants } from './constants';
import fetch from 'node-fetch';

import { getFavorites } from '../api/favorites';

export const getSong = async (songId: Number, cookies: string, isAuthed: boolean = false): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/songinfo.php?songID=${songId}`,
      {
        headers: {
          cookie: cookies
        }
      })
      .then(res => res.text())
      .then(async (response) => {
        const $ = cheerio.load(response);

        const song: any = { id: Number(songId), playback: {} };

        const canRequest = response.indexOf('request_icon_lightblue.gif') !== -1;

        song.canRequest = canRequest;
        const offset = canRequest ? 1 : 0;

        $(
          'table tr font[color="#FFFFFF"], table tr font[color="FFFFFF"], table tr font[color="#AAAAAA"]'
        ).each((index: number, element: any) => {
          const data = element.firstChild?.data?.trim();
          if (data !== undefined) {
            if (index === 0) song.themeParkAndLand = cleanse(data);
            if (index === 1) song.year = Number(data);
            if (index === 2) song.composer = cleanse(data);

            if (index === 3) {
              const minutes = Number(data.split(':')[0]);
              const seconds = Number(data.split(':')[1]);

              song.playback.durationDisplay = data;
              song.playback.duration = minutes * 60 + seconds;
            }

            if (index === 4) song.dateAdded = data;
            if (index === 5) song.lastPlayed = data;
            if (index === 6) song.lastRequested = data;
          }
        });

        $('a').each((index: number, element: any) => {
          const data = element.firstChild?.data?.trim();
          if (data !== undefined) {
            if (index === 1 + offset) song.attractionAndSong = cleanse(data);
            if (index === 2 + offset) song.comments = Number(data);
            if (index === 3 + offset) song.plays = Number(data);
            if (index === 4 + offset) song.requests = Number(data);
          }
        });

        song.isFavorite = false;

        if (isAuthed) {
          const favorites = await getFavorites(cookies);
          const favoritesIds = favorites.results.map((f: any) => f.id);

          song.isFavorite = favoritesIds.includes(song.id);
        }

        const firstImage = $(`img[width="200"]`)[0] as any;
        const imageUrl = encodeURIComponent(firstImage.attribs.src.trim().replace('pictures/', ''));
        const uabImageUrl = `${Constants.UAB_IMAGE_URL}/${imageUrl}`;

        song.uabImageUrl = uabImageUrl;
        song.imageUrl = `${Constants.FINAL_IMAGE_URL}${uabImageUrl}`;
        song.blurredImageUrl = `${Constants.BLURRED_IMAGE_URL}${uabImageUrl}`;

        song.images = {
          uabUrl: song.uabImageUrl,
          url: song.imageUrl,
          blurredUrl: song.blurredImageUrl
        };

        return resolve(song);
      }
      );
  });
};
