import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

// import db from '../models/db/index';
import querystring from 'querystring';

// db.sequelize.sync();
// const PushTokens = db.PushTokens;

export const login = async (username: string, password: string): Promise<string> => {
  const loginPostData = {
    username,
    password,
    login: 'Login',
    autologin: 'checked'
  };

  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  return new Promise<string>(function (resolve, reject) {
    client.post(
      'http://uabmagic.com/phpBB2/login.php',
      querystring.stringify(loginPostData)
    )
      .then(async ({ config }) => {
        const cookies = await config.jar.getCookies('http://uabmagic.com/');

        return resolve([cookies[0], cookies[1]].join(';'));
      });
  });
};

export const buildCookieFromQueryString = (userId: number, sid: string): string => {
  const authInfo = { userId, sid };

  return buildCookie(authInfo);
};

export const buildCookieFromAuthHeader = (authHeader: string): string => {
  const authInfo = getUserIdAndSidFromHeader(authHeader);

  return buildCookie(authInfo);
};

export const buildCookie = (authInfo: any): string => {
  const path = `path=/`
  const domain = `domain=uabmagic.com`;

  const consoleDataCookie = `uabmagicconsole_data=a%3A2%3A%7Bs%3A11%3A%22autologinid%22%3Bs%3A0%3A%22%22%3Bs%3A6%3A%22userid%22%3Bs%3A4%3A%22${authInfo.userId}%22%3B%7D`;
  const sidCookie = `uabmagicconsole_sid=${authInfo.sid}`;

  return [consoleDataCookie, path, domain, sidCookie, path, domain].join(';');
};

export const getUserIdAndSidFromHeader = (authHeader: string): any => {
  const authHeaderParts = authHeader.split(':');

  const userId = Number(authHeaderParts[0]);
  const sid = authHeaderParts[1];

  return { userId, sid };
};

export const updatePushToken = async (username: string, token: string): Promise<any> => {
  // let success = true;

  // try {
  //   const query = { where: { username } };

  //   let pushTokenModel = await PushTokens.findOne(query);

  //   if (pushTokenModel === null) {
  //     await PushTokens.create({
  //       username,
  //       token
  //     });
  //   } else {
  //     await PushTokens.update({
  //       token,
  //     }, query);
  //   }
  // } catch (err) {
  //   console.log(err);

  //   success = false;
  // }

  // return { success };
};
