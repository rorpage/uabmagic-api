import * as cheerio from 'cheerio';
import { login } from '../../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const query = vercelRequest.query.query as string;

  const username = process.env.SEARCH_USERNAME || ``;
  const password = process.env.SEARCH_PASSWORD || ``;

  const cookies = await login(username, password);

  const results = await search(query, cookies);

  vercelResponse.json({ results });
};

export const search = async (query: string, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/playlist.php?match=1&limit=1000&search=${query}`,
      {
        headers: {
          cookie: cookies
        }
      }
    )
      .then(res => res.text())
      .then((body) => {
        const $ = cheerio.load(body);

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
            song.id = Number(href.match(/-?\d+/g)[0]);
          }

          if (song.id === 0) return;

          const ratingImage = $(element).find(`img`)[5] as any;

          if (ratingImage) {
            song.rating = calculateRating(ratingImage.attribs.src.trim());
          }

          const image = $(element).find(`img`)[1] as any;

          if (image) {
            const imageUrl = encodeURIComponent(image.attribs.src.trim().replace(`pictures/`, ``));

            const uabImageUrl = `http://uabmagic.com/UABpages/pictures/${imageUrl}`;
            const finalImageUrl = `https://image-converter-five.vercel.app/api/convert?url=${uabImageUrl}`;
            const blurredImageUrl = `https://image-converter-five.vercel.app/api/blur?url=${uabImageUrl}`;

            song.images = {
              uabUrl: uabImageUrl,
              url: finalImageUrl,
              blurredUrl: blurredImageUrl
            };
          }

          const themeParkAndLandTd = tds.children().get(2);
          song.themeParkAndLand = $(themeParkAndLandTd).text().trim();

          const attractionAndSongTd = tds.children().get(4);
          song.attractionAndSong = $(attractionAndSongTd).text().trim();

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
