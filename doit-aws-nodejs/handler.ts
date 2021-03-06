import * as AWS from 'aws-sdk';
import { APIGatewayEvent, ProxyResult, ProxyCallback, Callback, Context, Handler } from 'aws-lambda';

const DEFAULT_DURATION_SECONDS = 1;

const randomizer = Math.random;;
const instanceId = Math.round(randomizer() * 1000000000);


export const run: Handler = (event: APIGatewayEvent, context: Context, cb: ProxyCallback) => {
  
  const durationString: string = event.queryStringParameters && event.queryStringParameters["duration"];
  const duration = durationString ? +durationString : DEFAULT_DURATION_SECONDS;

  let random = 0.0;
  let rounds = 0;

  var start = process.hrtime();

  while (process.hrtime(start)[0] < duration) {
    var nextRandom = randomizer();
    random = random + nextRandom - 0.5;
    rounds++;
  }

  const response = createResponse(200, {
    region: AWS.config.region,
    provider: "aws",
    runtime: "nodejs",
    instanceId,
    duration,
    rounds,
    roundsPerSecond: Math.round(rounds / duration),
    result: Math.round(random)
  });

  cb(null, response);
}

function createResponse(httpStatusCode: number, body: any): ProxyResult {
  return {
    statusCode: httpStatusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  };
}
