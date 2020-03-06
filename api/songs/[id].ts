import Cheerio from 'cheerio';
import { NowRequest, NowResponse } from '@now/node';
import request from 'request';

export default async (nowRequest: NowRequest, nowResponse: NowResponse) => {
  const songId = nowRequest.query.id;

  request(
    `http://uabmagic.com/UABpages/songinfo.php?songID=${songId}`,
    (error: any, requestResponse: request.Response, body: any) => {
      const $ = Cheerio.load(body);

      const response: any = { id: Number(songId), playback: {} };

      $(
        'table tr font[color="#FFFFFF"], table tr font[color="FFFFFF"], table tr font[color="#AAAAAA"]'
      ).each((index: number, element: CheerioElement) => {
        const data = element.firstChild?.data?.trim();
        if (data !== undefined) {
          // console.log(`${data} [${index}]`);
          if (index === 0) response.themeParkAndLand = data;
          if (index === 1) response.year = Number(data);
          if (index === 2) response.composer = data;

          if (index === 3) {
            const minutes = Number(data.split(':')[0]);
            const seconds = Number(data.split(':')[1]);
            response.playback.durationDisplay = data;
            response.playback.duration = minutes * 60 + seconds;
          }

          if (index === 4) response.dateAdded = data;
          if (index === 5) response.lastPlayed = data;
          if (index === 6) response.lastRequested = data;
        }
      });

      $('a').each((index: number, element: CheerioElement) => {
        const data = element.firstChild?.data?.trim();
        if (data !== undefined) {
          // console.log(`${data} [${index}]`);
          if (index === 1) response.attractionAndSong = data;
          if (index === 2) response.comments = Number(data);
          if (index === 3) response.plays = Number(data);
          if (index === 4) response.requests = Number(data);
        }
      });

      const imageUrl = $(`img[width="200"]`)[0].attribs.src.trim();
      response.imageUrl = `http://uabmagic.com/UABpages/${imageUrl}`;

      nowResponse.json(response);
    }
  );
};
