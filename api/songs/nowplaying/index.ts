import Cheerio from 'cheerio';
import { NowRequest, NowResponse } from '@now/node';
import request from 'request';

export default async (nowRequest: NowRequest, nowResponse: NowResponse) => {
  request(
    `http://uabmagic.com/UABpages/playing.php`,
    (error: any, requestResponse: request.Response, body: any) => {
      const $ = Cheerio.load(body);

      const response: any = { playback: {} };

      $('table tr font[color="#FFFFFF"], table tr font[color="#AAAAAA"]').each(
        (index: number, element: CheerioElement) => {
          const data = element.firstChild?.data?.trim();
          if (data !== undefined) {
            // console.log(`${data} [${index}]`);
            if (index === 4) response.themeParkAndLand = data;
            if (index === 5) response.attractionAndSong = data;
            if (index === 7) response.year = Number(data);
            if (index === 8) response.composer = data;

            if (index === 9) {
              const minutes = Number(data.split(':')[0]);
              const seconds = Number(data.split(':')[1]);
              response.playback.durationDisplay = data;
              response.playback.duration = minutes * 60 + seconds;
            }

            if (index === 11) response.plays = Number(data);
            if (index === 12) response.requests = Number(data);
          }
        }
      );

      const imageUrl = $(`img[width="200"]`)[0].attribs.src.trim();
      response.imageUrl = `http://uabmagic.com/UABpages/${imageUrl}`;

      const scriptTags = $(`script`);
      response.playback.timeLeft = Number(
        scriptTags.get(scriptTags.length - 1).children[0].data.match(/\d+/)
      );

      response.upNext = $(`font[color="#A5B7C9"]`)
        .first()
        .children()
        .first()
        .html()
        .split('<br><br>')
        .map((song: string) => song.trim())
        .filter(String);

      nowResponse.json(response);
    }
  );
};
