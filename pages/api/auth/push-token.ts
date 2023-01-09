import { updatePushToken } from '../../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pushTokenEndpoint = async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { username, userid, token } = vercelRequest.body;

  if (vercelRequest.method !== 'POST') {
    vercelResponse.status(405).json({ error: 'Invalid method' });

    return;
  }

  if (username === undefined || userid === undefined || token === undefined) {
    vercelResponse.status(400).send(`username, userid, and token are required`);

    return;
  }

  try {
    const response = await updatePushToken(username, userid, token);

    vercelResponse.status(200).json(response);
  } catch (error) {
    vercelResponse.status(500).json({ error });
  }
};

export default pushTokenEndpoint;
