import { Constants } from "./constants";
import { DialogFlowResponse } from "../models/response/dialogflow/dialogflow-response";
import * as nowPlayingFetcher from '../utilities/now-playing-fetcher';

export const processRequest = async (
  action: string,
  parameters: {
  }
): Promise<any> => {
  if (action === Constants.WELCOME || action === 'DefaultWelcomeIntent') {
    return processWelcomeRequest();
  } else if (action === Constants.LISTEN || action === 'Listen') {
    return await processListenRequest();
  } else if (action === Constants.NOWPLAYING || action === 'NowPlaying') {
    return await processNowPlayingRequest();
  } else {
    const result = "Sorry! We don't handle that query yet!";
    const response = buildResponse(result, result);
    addResponseRequest(response);
    return response;
  }
}

function processWelcomeRequest() {
  const welcomeResponses = [
    `No privacy at all around this place! What can I do for you?`,
    `Oh, hello there. So glad you could come along! I am UABMagic. How can I help?`,
    `We are now conducting our final systems check. How can I help?`,
    `To all who come to this happy app, welcome! What can I do for you?`,
    `My siestas are getting shorter and shorter. How can I help?`,
    `Welcome, foolish mortal, to the UABMagic app. How can I be of assistance?`,
  ];

  const index = Math.floor(Math.random() * welcomeResponses.length);
  const randomResponse = welcomeResponses[index];

  const responseObject = buildResponse(randomResponse, randomResponse);

  return responseObject;
}

async function processListenRequest() {
  const info = await getNowPlayingSongInfo();

  const listenInfo = {
    content: 'Listen to the Land, Tune in the World',
    displayText: info.displayText,
    featured_image: Constants.STREAM_IMAGE,
    media_url: Constants.STREAM_URL,
    speech: info.speech,
  };

  return buildMediaResponse(listenInfo);
}

async function processNowPlayingRequest() {
  const info = await getNowPlayingSongInfo();

  const responseObject = buildResponse(info.speech, info.displayText);
  addResponseRequest(responseObject);

  return responseObject;
}

async function getNowPlayingSongInfo() {
  const nowPlayingSong = await nowPlayingFetcher.getNowPlayingSong();

  let speech = `Playing right now on <say-as interpret-as=\"characters\">UAB</say-as> Magic is ${nowPlayingSong.attractionAndSong} from ${nowPlayingSong.themeParkAndLand}.`;
  let displayText = `Playing right now on UABMagic is ${nowPlayingSong.attractionAndSong} from ${nowPlayingSong.themeParkAndLand}.`;

  if (nowPlayingSong.requestor !== '') {
    const requestorText = ` It was requested by ${nowPlayingSong.requestor}`;

    speech = speech.concat(requestorText);
    displayText = displayText.concat(requestorText);
  }

  return {
    displayText,
    speech
  };
}

function buildResponse(
  speech: string,
  displayText: string,
  expectUserResponse = true
) {
  const response = new DialogFlowResponse();

  response.fulfillment_text = displayText;

  response.payload.google.expectUserResponse = expectUserResponse;

  response.payload.google.richResponse = { items: [] };
  response.payload.google.richResponse.items.push({
    simpleResponse: {
      displayText: `${displayText}`,
      textToSpeech: `<speak>${speech}</speak>`,
    },
  });

  return response;
}

function buildMediaResponse(media: any, expectUserResponse = false) {
  const response = buildResponse(
    media.speech,
    media.displayText,
    expectUserResponse
  );

  response.payload.google.richResponse.items.push({
    mediaResponse: {
      mediaObjects: [
        {
          contentUrl: media.media_url,
          description: media.content,
          name: media.title,
          url: media.media_url,
          image: {
            accessibilityText: media.title,
            url: media.featured_image
          },
          icon: {
            accessibilityText: media.title,
            url: media.featured_image
          }
        }
      ],
      mediaType: 'AUDIO'
    }
  });

  addResponseRequest(response, expectUserResponse);

  return response;
}

function addResponseRequest(response: any, expectUserResponse = true) {
  if (expectUserResponse) {
    response.payload.google.richResponse.items.push(buildUserResponseRequest());
  }
}

function buildUserResponseRequest() {
  const prompts = [
    `Anything else?`,
    `What else can I do for you?`,
    `Need more assistance?`,
  ];

  const index = Math.floor(Math.random() * prompts.length);

  return {
    simpleResponse: {
      displayText: `${prompts[index]}`,
      textToSpeech: `<speak>${prompts[index]}</speak>`,
    },
  };
}
