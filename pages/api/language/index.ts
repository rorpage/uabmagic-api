import { NowRequest, NowResponse } from '@now/node';
import * as requestProcessor from '../../../utilities/request-processor';

export default async (req: NowRequest, res: NowResponse) => {
  const action = req.body.queryResult?.action;
  const parameters = req.body.queryResult?.parameters;

  const response = await requestProcessor.processRequest(action, parameters);

  res.json(response);
};
