import * as cheerio from 'cheerio';
import { cleanse } from '../../../utilities/string-cleaner';
import { Constants } from '../../../utilities/constants';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { allTime, monthly, weekly } = vercelRequest.body;

  const topSongData = `alltime=${allTime || 1}&monthly=+${monthly || 1}&weekly=+${weekly || 1}`;

  await fetch(`http://uabmagic.com/UABpages/top_songs.php`,
    {
      method: `POST`,
      redirect: `manual`,
      body: topSongData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
    .then(res => res.text())
    .then((body) => {
      const $ = cheerio.load(body);

      const response: any = { allTime: [], monthly: [], weekly: [] };

      $('form td[valign="top"]').each((tableIndex: number, tableTd: any) => {
        const list: any[] = [];

        const trs = $(tableTd).find(`tr`);

        trs.each((trIndex: number, tr: any) => {
          if (trIndex === 0) return true;

          const tds = $(tr).find(`td`);

          const song = { attractionAndSong: '', id: 0, images: {}, rank: 0, requests: 0, themeParkAndLand: '' };

          tds.each((tdIndex: number, td: cheerio.Element) => {
            // Rank
            if (tdIndex === 0) {
              const item = $($(td).children().get(0));
              const cleanText = item.text().trim();

              song.rank = Number(cleanText.replace('#', ''));
            }

            // Images
            if (tdIndex === 1) {
              const image = $(td).find(`img`)[0] as any;

              if (image) {
                const imageUrl = encodeURIComponent(image.attribs.src.trim().replace(`pictures/`, ``));

                const uabImageUrl = `${Constants.UAB_IMAGE_URL}/${imageUrl}`;
                const finalImageUrl = `${Constants.FINAL_IMAGE_URL}${uabImageUrl}`;
                const blurredImageUrl = `${Constants.BLURRED_IMAGE_URL}${uabImageUrl}`;

                song.images = {
                  uabUrl: uabImageUrl,
                  url: finalImageUrl,
                  blurredUrl: blurredImageUrl
                };
              }
            }

            // Song info
            if (tdIndex === 2) {
              const tdChildren = $(td).children();

              song.themeParkAndLand = cleanse($(tdChildren.get(0)).text());
              song.requests = Number($(tdChildren.get(1)).text().replace('(', '').replace(')', '').trim());

              const attractionAndSong = $(tdChildren.get(3));
              const attractionAndSongATag = attractionAndSong.find('a')[0];

              song.attractionAndSong = cleanse($(attractionAndSongATag).text());

              const href = $(attractionAndSongATag).attr(`href`);

              if (href !== undefined) {
                song.id = Number(href.match(/-?\d+/g)[0]);
              }
            }
          });

          list.push(song);
        });

        if (tableIndex === 0) response.allTime = list;
        if (tableIndex === 1) response.monthly = list;
        if (tableIndex === 2) response.weekly = list;
      });

      vercelResponse.json(response);
    });
}
