import { login } from '../../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

const loginEndpoint = async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { username, password } = vercelRequest.body;

  if (username === undefined || password === undefined) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookies = await login(username, password);

  const userIdCookiePart = decodeURIComponent(cookies.split(';')[0].replace(`uabmagicconsole_data=`, ``));
  const cookieMatch = userIdCookiePart.match(/-?\d+/g) ?? '';
  const userId = Number(cookieMatch[5]);

  const sid = decodeURIComponent(cookies.split(';')[4].replace(`uabmagicconsole_sid=`, ``));

  vercelResponse.json({ userId, sid });
};

export default loginEndpoint;
