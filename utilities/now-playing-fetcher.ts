import Cheerio from 'cheerio';
import request from 'request';
import { cleanse } from './string-cleaner';
import { NowPlayingSong } from '../models/now-playing-song';

export const getNowPlayingSong = async (): Promise<NowPlayingSong> => {
  return new Promise<NowPlayingSong>(function (resolve, reject) {
    request(
      `http://uabmagic.com/UABpages/playing.php`,
      (error: any, requestResponse: request.Response, body: any) => {
        const $ = Cheerio.load(body);

        const response = new NowPlayingSong();

        $('a').each((index: number, element: any) => {
          if (index === 2)
            response.id = Number(element.attribs.href.match(/\d+/));
        });

        const scriptTags = $(`script`);
        response.playback.timeLeft = Number(
          scriptTags.get(scriptTags.length - 1).children[0].data.match(/\d+/)
        );

        const scheduleData = $('font[color="#FFFFFF"] b')[1] as any;
        response.schedule = cleanse(scheduleData.firstChild?.data)
          .replace('Now playing: ', '');

        const requestorElement = $('img[src="images/requested-by.gif"]').parent().siblings('td') as any;
        response.requestor = cleanse(requestorElement.text());

        const songInfoOffset = (response.schedule.indexOf('Weekly Top Ten Countdown') !== -1) ? 1 : 0;

        $('table tr font[color="#FFFFFF"], table tr font[color="#AAAAAA"]').each(
          (index: number, element: any) => {
            const data = element.firstChild?.data?.trim();

            if (data !== undefined) {
              if (index === 4) response.themeParkAndLand = cleanse(data);
              if (index === 5) response.attractionAndSong = cleanse(data);
              if (index === 7 + songInfoOffset) response.year = Number(data);
              if (index === 8 + songInfoOffset) response.composer = data;

              if (index === 9 + songInfoOffset) {
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

        const firstImage = $(`img[width="200"]`)[0] as any;
        const imageUrl = encodeURIComponent(firstImage.attribs.src.trim().replace('pictures/', ''));

        const uabImageUrl = `http://uabmagic.com/UABpages/pictures/${imageUrl}`;
        const finalImageUrl = `https://image-converter-five.vercel.app/api/convert?url=${uabImageUrl}`;
        const blurredImageUrl = `https://image-converter-five.vercel.app/api/blur?url=${uabImageUrl}`;

        response.images = {
          uabUrl: uabImageUrl,
          url: finalImageUrl,
          blurredUrl: blurredImageUrl
        };

        response.upNext = $(`font[color="#A5B7C9"]`)
          .first()
          .children()
          .first()
          .html()
          .split('<br><br>')
          .map((song: string) => {
            const songHtml = Cheerio.load(song.trim()) as any;

            return cleanse(songHtml.text());
          })
          .filter(String);

        return resolve(response);
      }
    );
  });
};
