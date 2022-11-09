import { DialogFlowPayload } from './dialogflow-payload';

export class DialogFlowResponse {
  // tslint:disable-next-line: variable-name
  public fulfillment_text: string | undefined;
  public payload: DialogFlowPayload;
  constructor() {
    this.payload = new DialogFlowPayload();
  }
}
