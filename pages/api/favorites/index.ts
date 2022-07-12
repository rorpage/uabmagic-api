import { buildCookieFromAuthHeader } from '../../../utilities/authenticator';
import * as cheerio from 'cheerio';
import { cleanse } from '../../../utilities/string-cleaner';
import { Constants } from '../../../utilities/constants';

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  if (!vercelRequest.headers.authorization) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookie = buildCookieFromAuthHeader(vercelRequest.headers.authorization);

  await processFavorites(vercelRequest, vercelResponse, cookie);
};

export const processFavorites =
  async (vercelRequest: VercelRequest, vercelResponse: VercelResponse, cookie: string) => {
    if (vercelRequest.method === 'GET') {
      const requestResponse = await getFavorites(cookie);

      vercelResponse.json(requestResponse);
    } else if (vercelRequest.method === 'POST') {
      const { songId } = vercelRequest.body;

      const response = await processFavorite('add', songId, cookie);

      vercelResponse.json(response);
    } else if (vercelRequest.method === 'DELETE') {
      const { songId } = vercelRequest.body;

      const response = await processFavorite('delete', songId, cookie);

      vercelResponse.json(response);
    } else {
      vercelResponse.status(405).json({ error: 'Invalid method' });
    }
  };

const getFavorites = async (cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch('http://uabmagic.com/UABpages/view_favorites.php?limit=200',
      {
        headers: {
          cookie: cookies
        }
      }
    )
      .then((res: Response) => res.text())
      .then(async (body: string) => {

        const $ = cheerio.load(body);

        const results: any[] = [];

        const favoritesTtable = $(`table[align="center"]`)[5];

        const songs = $(favoritesTtable).find(`tr`);

        songs.each((trIndex: number, trElement: any) => {
          if (trIndex === 0 || trIndex === songs.length - 1) return;

          let song: any = {};

          song.canRequest = $(trElement).html().indexOf('request_icon_lightblue.gif') !== -1;

          $(trElement).find(`td`)
            .each((index: number, element: any) => {
              if (index === 1) {
                const correctedImage = $(element).html().replace('\n', '');
                const url = $(correctedImage).attr('src').trim().replace('pictures/', '');
                const image = encodeURIComponent(cleanse(url));

                const uabImageUrl = `${Constants.UAB_IMAGE_URL}/${image}`;
                const imageUrl = `${Constants.FINAL_IMAGE_URL}${uabImageUrl}`
                const blurredImageUrl = `${Constants.BLURRED_IMAGE_URL}${uabImageUrl}`;

                song.images = {
                  uabUrl: uabImageUrl,
                  url: imageUrl,
                  blurredUrl: blurredImageUrl
                };
              }

              if (index === 2) {
                const fonts = $(element).find(`font`);
                const pieces = $(fonts[0]).text().trim().split('\n');

                song.themeParkAndLand = cleanse(pieces[0]);
                song.attractionAndSong = cleanse(pieces[3]);
              }

              if (index === 5) {
                const input = $(element).find(`input`)[0];

                song.id = Number(input.attribs.value);
              }
            });

          results.push(song);
        });

        return resolve({ results });
      });
  });
};

const processFavorite = async (action: string, songId: Number, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    const formData = action === 'add' ? `add_${songId}=${songId}` : `delete__${songId}=${songId}`;

    fetch('http://uabmagic.com/UABpages/do-favorites.php',
      {
        body: formData,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          cookie: cookies
        }
      }
    )
      .then((res: Response) => res.text())
      .then(async (body: string) => {
        const success = body.indexOf('Favorites updated') !== -1;

        const favorites = await getFavorites(cookies);

        return resolve({ success, favorites });
      });
  });
};
