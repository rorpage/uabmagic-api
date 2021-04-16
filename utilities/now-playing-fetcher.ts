import Cheerio from 'cheerio';
import request from 'request';
import { cleanse } from './string-cleaner';
import { NowPlayingSong } from '../models/now-playing-song';

function getSongInfoByImage(root: cheerio.Root, image: string): string {
  const element = root(`img[src="images/${image}.gif"]`).parent().siblings('td') as any;
  return cleanse(element.text());
}

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

        response.themeParkAndLand = getSongInfoByImage($, 'themepark-land');
        response.attractionAndSong = getSongInfoByImage($, 'attraction-song');
        response.year = Number(getSongInfoByImage($, 'year'));
        response.requestor = getSongInfoByImage($, 'requested-by');
        response.composer = getSongInfoByImage($, 'composer');
        response.plays = Number(getSongInfoByImage($, 'num-plays'));
        response.requests = Number(getSongInfoByImage($, 'num-requests'))

        const durationText = getSongInfoByImage($, 'duration').split(' ')[0];
        const minutes = Number(durationText.split(':')[0]);
        const seconds = Number(durationText.split(':')[1]);

        response.playback.durationDisplay = durationText;
        response.playback.duration = minutes * 60 + seconds;

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
