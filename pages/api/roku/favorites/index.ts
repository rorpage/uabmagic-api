import { VercelRequest, VercelResponse } from '@vercel/node';

import { buildCookieFromQueryString } from '../../../../utilities/authenticator';
import { processFavorites } from '../../favorites/index';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { userId, sid } = vercelRequest.query;

  if (!userId || !sid) {
    vercelResponse.status(401).send(`Unauthorized`);

    return;
  }

  const cookie = buildCookieFromQueryString(Number(userId), String(sid));

  await processFavorites(vercelRequest, vercelResponse, cookie);
};
