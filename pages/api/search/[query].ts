import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { cleanse } from '../../../utilities/string-cleaner';
import { Constants } from '../../../utilities/constants';
import { login } from '../../../utilities/authenticator';

const searchEndpoint = async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const query = vercelRequest.query.query as string;

  const username = process.env.SEARCH_USERNAME || ``;
  const password = process.env.SEARCH_PASSWORD || ``;

  const cookies = await login(username, password);

  const results = await search(query, cookies);

  vercelResponse.json({ results });
};

export const search = async (query: string, cookies: string): Promise<any> => {
  query = query.replace("'", "''");

  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/playlist.php?match=1&limit=1000&search=${query}`,
      {
        headers: {
          cookie: cookies
        }
      }
    )
      .then(res => res.text())
      .then((response) => {
        const $ = cheerio.load(response);

        const playlist = $(`font:contains("Playlist results")`)
          .closest(`table`)
          .children(`tbody`)
          .children(`tr`);

        const results: any[] = [];

        playlist.each((index: number, element: any) => {
          if (index === 0) return true;

          const tds = $(element).find(`td`);

          let song = {
            id: 0,
            attractionAndSong: ``,
            images: {},
            miles: 0,
            playback: {
              duration: 0,
              durationDisplay: ``
            },
            rating: 0,
            themeParkAndLand: ``
          };

          const idTd = tds.children().get(5);
          const aTag = $(idTd).find(`a`)[0];
          const href = $(aTag).attr(`href`);

          if (href !== undefined) {
            const songId = href.match(/-?\d+/g) ?? '';
            song.id = Number(songId[0]);
          }

          if (song.id === 0) return;

          const ratingImage = $(element).find(`img`)[5] as any;

          if (ratingImage) {
            song.rating = calculateRating(ratingImage.attribs.src.trim());
          }

          const image = $(element).find(`img`)[1] as any;

          if (image) {
            const imageUrl = encodeURIComponent(image.attribs.src.trim().replace(`pictures/`, ``));

            const uabImageUrl = `${Constants.UAB_IMAGE_URL}/${imageUrl}`;
            const finalImageUrl = `${uabImageUrl}`
              .replace('.gif', '.png')
              .replace('.GIF', '.png')
              .replace('.jpg', '.png')
              .replace('.JPG', '.png');
            const blurredImageUrl = `${uabImageUrl}`
              .replace('.gif', '_blurred.png')
              .replace('.GIF', '_blurred.png')
              .replace('.jpg', '_blurred.png')
              .replace('.JPG', '_blurred.png');

            song.images = {
              uabUrl: uabImageUrl,
              url: finalImageUrl,
              blurredUrl: blurredImageUrl
            };
          }

          const themeParkAndLandTd = tds.children().get(2);
          song.themeParkAndLand = cleanse($(themeParkAndLandTd).text());

          const attractionAndSongTd = tds.children().get(4);
          song.attractionAndSong = cleanse($(attractionAndSongTd).text());

          const miles = tds.children().get(6);
          song.miles = Number($(miles).text().trim());

          const durationTd = tds.children().get(8);
          const durationText = $(durationTd).text().trim();
          const minutes = Number(durationText.split(':')[0]);
          const seconds = Number(durationText.split(':')[1]);

          song.playback.durationDisplay = durationText;
          song.playback.duration = minutes * 60 + seconds;

          results.push(song);
        });

        return resolve(results);
      });
  });
};

export const calculateRating = (ratingImage: string): number => {
  const trimmedImage = ratingImage.replace(`images/`, ``)
    .replace(`.gif`, ``)
    .trim();

  if (trimmedImage === `1star`) return 1;
  if (trimmedImage === `1andhalfstar`) return 1.5;
  if (trimmedImage === `2stars`) return 2;
  if (trimmedImage === `2andhalfstar`) return 2.5;
  if (trimmedImage === `3stars`) return 3;
  if (trimmedImage === `3andhalfstar`) return 3.5;
  if (trimmedImage === `4stars`) return 4;
  if (trimmedImage === `4andhalfstar`) return 4.5;
  if (trimmedImage === `5stars`) return 5;

  return 0;
};

export default searchEndpoint;
