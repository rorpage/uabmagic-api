import { login } from '../../../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { username, password } = vercelRequest.query;

  if (username === undefined || password === undefined) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookies = await login(String(username), String(password));

  const userIdCookiePart = decodeURIComponent(cookies.split(';')[0].replace(`uabmagicconsole_data=`, ``));
  const userId = Number(userIdCookiePart.match(/-?\d+/g)[5]);

  const sid = decodeURIComponent(cookies.split(';')[4].replace(`uabmagicconsole_sid=`, ``));

  vercelResponse.json({ userId, sid });
};
