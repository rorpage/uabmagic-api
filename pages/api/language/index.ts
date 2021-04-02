import { VercelRequest, VercelResponse } from '@vercel/node';
import * as requestProcessor from '../../../utilities/request-processor';

export default async (req: VercelRequest, res: VercelResponse) => {
  const action = req.body.queryResult?.action;
  const parameters = req.body.queryResult?.parameters;

  const response = await requestProcessor.processRequest(action, parameters);

  res.json(response);
};
