import * as cheerio from 'cheerio';

export const getSong = async (songId: Number, cookies: string): Promise<any> => {
  return new Promise<any>(function (resolve, reject) {
    fetch(`http://uabmagic.com/UABpages/songinfo.php?songID=${songId}`,
      {
        headers: {
          cookie: cookies
        }
      })
      .then(res => res.text())
      .then((body) => {
        const $ = cheerio.load(body);

        const response: any = { id: Number(songId), playback: {} };

        const canRequest = body.indexOf('request_icon_lightblue.gif') !== -1;

        response.canRequest = canRequest;
        const offset = canRequest ? 1 : 0;

        $(
          'table tr font[color="#FFFFFF"], table tr font[color="FFFFFF"], table tr font[color="#AAAAAA"]'
        ).each((index: number, element: any) => {
          const data = element.firstChild?.data?.trim();
          if (data !== undefined) {
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

        $('a').each((index: number, element: any) => {
          const data = element.firstChild?.data?.trim();
          if (data !== undefined) {
            if (index === 1 + offset) response.attractionAndSong = data;
            if (index === 2 + offset) response.comments = Number(data);
            if (index === 3 + offset) response.plays = Number(data);
            if (index === 4 + offset) response.requests = Number(data);
          }
        });

        const firstImage = $(`img[width="200"]`)[0] as any;
        const imageUrl = encodeURIComponent(firstImage.attribs.src.trim().replace('pictures/', ''));
        const uabImageUrl = `http://uabmagic.com/UABpages/pictures/${imageUrl}`;

        response.uabImageUrl = uabImageUrl;
        response.imageUrl = `https://image-converter-five.vercel.app/api/convert?url=${uabImageUrl}`;
        response.blurredImageUrl = `https://image-converter-five.vercel.app/api/blur?url=${uabImageUrl}`;

        response.images = {
          uabUrl: response.uabImageUrl,
          url: response.imageUrl,
          blurredUrl: response.blurredImageUrl
        };

        return resolve(response);
      }
      );
  });
};
