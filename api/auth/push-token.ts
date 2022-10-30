import { updatePushToken } from '../../utilities/authenticator';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (vercelRequest: VercelRequest, vercelResponse: VercelResponse) => {
  const { username, token } = vercelRequest.body;

  if (username === undefined || token === undefined) {
    vercelResponse.status(400).send(`Username and token are required`);

    return;
  }

  if (vercelRequest.method !== 'POST') {
    vercelResponse.status(405).json({ error: 'Invalid method' });

    return;
  }

  try {
    const response = await updatePushToken(username, token);

    vercelResponse.status(200).json(response);
  } catch (error) {
    vercelResponse.status(500).json({ error });
  }
};
