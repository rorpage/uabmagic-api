import * as cheerio from 'cheerio';
import { cleanse } from './string-cleaner';
import { Constants } from './constants';
import { NowPlayingSong } from '../models/now-playing-song';

const refreshTime = 15;

function getSongInfoByImage(root: any, image: string): string {
  const element = root(`img[src="images/${image}.gif"]`).parent().siblings('td') as any;
  return cleanse(element.text());
}

export const getNowPlayingSong = async (): Promise<NowPlayingSong> => {
  return new Promise<NowPlayingSong>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/playing.php`)
      .then(res => res.text())
      .then((body) => {
        const $ = cheerio.load(body);

        const response = new NowPlayingSong();

        let songId = 0;
        try {
          const songIdMatch = $(`img[src="images/overall-rating.gif"]`).parent()
            .siblings('td')
            .children('b')
            .children('font')
            .children('a')
            .attr('href')
            .match(/-?\d+/g)[0];

          songId = Number(songIdMatch);
        } catch (e) {
          console.log(e);
        }

        response.id = songId;

        const scriptTags = $(`script`);
        const scriptTagsElements = scriptTags.get(scriptTags.length - 1) as any;
        const timeLeftString = scriptTagsElements.firstChild?.data.match(/-?\d+/g);
        const timeLeftNumber = Number(timeLeftString[0]);

        const adjustTimeLeft = timeLeftNumber < 0;
        const timeLeft = adjustTimeLeft ? refreshTime : timeLeftNumber;

        response.playback.timeLeft = timeLeft;

        const timeLeftMinutes = Math.floor(timeLeft / 60);
        const timeLeftSeconds = timeLeft - timeLeftMinutes * 60;
        const timeLeftSecondsDisplay = timeLeftSeconds < 10 ? `0${timeLeftSeconds}` : `${timeLeftSeconds}`;
        response.playback.timeLeftDisplay = `${timeLeftMinutes}:${timeLeftSecondsDisplay}`;

        if (adjustTimeLeft) {
          response.playback.durationDisplay = `0:${refreshTime}`;
          response.playback.duration = refreshTime;
        } else {
          const durationText = getSongInfoByImage($, 'duration').split(' ')[0];
          const minutes = Number(durationText.split(':')[0]);
          const seconds = Number(durationText.split(':')[1]);

          response.playback.durationDisplay = durationText;
          response.playback.duration = minutes * 60 + seconds;
        }

        const scheduleData = $('font[color="#FFFFFF"] b')[1] as any;
        response.schedule = cleanse(scheduleData.firstChild?.data)
          .replace('Now playing: ', '');

        response.themeParkAndLand = getSongInfoByImage($, 'themepark-land');
        response.attractionAndSong = getSongInfoByImage($, 'attraction-song');
        response.year = Number(getSongInfoByImage($, 'year'));
        response.requestor = getSongInfoByImage($, 'requested-by');
        response.composer = getSongInfoByImage($, 'composer');
        response.plays = Number(getSongInfoByImage($, 'num-plays'));
        response.requests = Number(getSongInfoByImage($, 'num-requests'));

        const firstImage = $(`img[width="200"]`)[0] as any;
        const imageUrl = encodeURIComponent(firstImage.attribs.src.trim().replace('pictures/', ''));

        const uabImageUrl = `${Constants.UAB_IMAGE_URL}/${imageUrl}`;
        const finalImageUrl = `${Constants.FINAL_IMAGE_URL}${uabImageUrl}`;
        const blurredImageUrl = `${Constants.BLURRED_IMAGE_URL}${uabImageUrl}`;

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
            const songHtml = cheerio.load(song.trim()) as any;

            return cleanse(songHtml.text());
          })
          .filter(String);

        return resolve(response);
      }
      );
  });
};
