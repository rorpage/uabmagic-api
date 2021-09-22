export const login = async (username: string, password: string): Promise<string> => {
  const loginPostData = `username=${username}&password=${password}&login=Login&autologin=checked`;

  return new Promise<string>(function (resolve, reject) {
    fetch(`http://uabmagic.com/phpBB2/login.php`,
      {
        method: `POST`,
        redirect: `manual`,
        body: loginPostData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    .then((res: any) => {
      const raw = res.headers.raw()[`set-cookie`];
      return resolve([ raw[2], raw[3] ].join(`;`));
    });
  });
};

export const buildCookie = (authHeader: string): string => {
  const authInfo = getUserIdAndSidFromHeader(authHeader);

  const path = `path=/`
  const domain = `domain=uabmagic.com`;

  const consoleDataCookie = `uabmagicconsole_data=a%3A2%3A%7Bs%3A11%3A%22autologinid%22%3Bs%3A0%3A%22%22%3Bs%3A6%3A%22userid%22%3Bs%3A4%3A%22${authInfo.userId}%22%3B%7D`;
  const sidCookie = `uabmagicconsole_sid=${authInfo.sid}`;

  return [ consoleDataCookie, path, domain, sidCookie, path, domain ].join(';');
};

export const getUserIdAndSidFromHeader = (authHeader: string): any => {
  const authHeaderParts = authHeader.split(':');

  const userId = Number(authHeaderParts[0]);
  const sid = authHeaderParts[1];

  return { userId, sid };
};
