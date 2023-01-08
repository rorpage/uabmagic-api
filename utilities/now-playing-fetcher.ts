import * as cheerio from 'cheerio';
import { cleanse, cleanSchedule } from './string-cleaner';
import { Constants } from './constants';
import fetch from 'node-fetch';

import { NowPlayingSong } from '../models/now-playing-song';
import { buildCookieFromAuthHeader } from '../utilities/authenticator';

const refreshTime = 15;

function getSongInfoByImage(root: any, image: string, fixCase = true): string {
  const element = root(`img[src="images/${image}.gif"]`).parent().siblings('td') as any;

  return cleanse(element.text(), fixCase);
}

function buildTimeDisplayText(time: number): string {
  const timeMinutes = Math.floor(time / 60);
  const timeSeconds = time - timeMinutes * 60;
  const timeSecondsDisplay = timeSeconds < 10 ? `0${timeSeconds}` : `${timeSeconds}`;

  return `${timeMinutes}:${timeSecondsDisplay}`;
}

export const getNowPlayingSong = async (cookies: string = ''): Promise<NowPlayingSong> => {
  const headers = cookies.length === 0 ? {}
    : {
      headers: {
        Cookie: buildCookieFromAuthHeader(cookies)
      }
    };

  return new Promise<NowPlayingSong>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/playing.php`, headers)
      .then(res => res.text())
      .then((response) => {
        const $ = cheerio.load(response);

        const nowPlayingSong = new NowPlayingSong();

        let songId = 0;
        try {
          const ratingParent = $(`img[src="images/overall-rating.gif"]`).parent();
          const songIdMatch = ratingParent
            ?.siblings('td')
            ?.children('b')
            ?.children('font')
            ?.children('a')
            ?.attr('href')
            ?.match(/-?\d+/g) ?? '';

          songId = Number(songIdMatch[0]);
        } catch (e) {
          console.log(e);
        }

        nowPlayingSong.id = songId;

        const scriptTags = $(`script`);
        const scriptTagsElements = scriptTags.get(scriptTags.length - 1) as any;
        const timeLeftString = scriptTagsElements.firstChild?.data.match(/-?\d+/g);
        const timeLeftNumber = Number(timeLeftString[0]);

        const adjustTimeLeft = timeLeftNumber < 0;
        const timeLeft = adjustTimeLeft ? refreshTime : timeLeftNumber;

        nowPlayingSong.playback.timeLeft = timeLeft;
        nowPlayingSong.playback.timeLeftDisplay = buildTimeDisplayText(timeLeft);

        let duration = refreshTime;

        if (adjustTimeLeft) {
          nowPlayingSong.playback.durationDisplay = `0:${refreshTime}`;
        } else {
          const durationText = getSongInfoByImage($, 'duration').split(' ')[0];
          const minutes = Number(durationText.split(':')[0]);
          const seconds = Number(durationText.split(':')[1]);

          nowPlayingSong.playback.durationDisplay = durationText;

          duration = minutes * 60 + seconds;
        }

        nowPlayingSong.playback.duration = duration;

        nowPlayingSong.playback.timeElapsed = duration - timeLeft;
        nowPlayingSong.playback.timeElapsedDisplay = buildTimeDisplayText(duration - timeLeft);

        const scheduleData = $('font[color="#FFFFFF"] b')[1] as any;
        nowPlayingSong.schedule = cleanSchedule(scheduleData.firstChild?.data);

        nowPlayingSong.isArtistBlock =
          nowPlayingSong.schedule.indexOf("The Artists Block") !== -1;

        nowPlayingSong.isWeeklyCountdown =
          nowPlayingSong.schedule.indexOf("Weekly Top Ten Countdown") !== -1;

        // User is authenticated and passed a valid auth header
        if ($.html().indexOf('Please login to use this feature') === -1) {
          const songInfo = $(`table[bgcolor="#393939"]`) as any;

          nowPlayingSong.isFavorite = songInfo.html().indexOf("checkmark.png") !== -1;
        }

        nowPlayingSong.themeParkAndLand = getSongInfoByImage($, 'themepark-land');
        nowPlayingSong.attractionAndSong = getSongInfoByImage($, 'attraction-song');
        nowPlayingSong.year = Number(getSongInfoByImage($, 'year'));

        const uabOMaticString = 'UAB-O-MATIC ACTIVE: ';
        const requestor = getSongInfoByImage($, 'requested-by', false);

        if (requestor.indexOf(uabOMaticString) === -1) {
          nowPlayingSong.requestor = requestor;
        } else {
          nowPlayingSong.isUabYourWayShow = true;
          nowPlayingSong.schedule = nowPlayingSong.schedule.replace(':', '');
          nowPlayingSong.uabYourWayUser = requestor.replace(uabOMaticString, '').trim();
        }

        nowPlayingSong.composer = getSongInfoByImage($, 'composer');
        nowPlayingSong.plays = Number(getSongInfoByImage($, 'num-plays'));
        nowPlayingSong.requests = Number(getSongInfoByImage($, 'num-requests'));

        const firstImage = $(`img[width="200"]`)[0] as any;
        const imageUrl = encodeURIComponent(firstImage.attribs.src.trim().replace('pictures/', ''));

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

        nowPlayingSong.images = {
          uabUrl: uabImageUrl,
          url: finalImageUrl,
          blurredUrl: blurredImageUrl
        };

        nowPlayingSong.upNext = $(`font[color="#A5B7C9"]`)
          ?.first()
          ?.children()
          ?.first()
          ?.html()
          ?.split('<br><br>')
          .map((song: string) => {
            const songHtml = cheerio.load(song.trim()) as any;
            const songHtmlText = songHtml.text();

            return cleanse(songHtmlText, false);
          })
          .filter(String);

        return resolve(nowPlayingSong);
      }
      );
  });
};
