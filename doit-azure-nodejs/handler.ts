
const DEFAULT_DURATION_SECONDS = 1;

const randomizer = Math.random;;
const instanceId = Math.round(randomizer() * 1000000000);

export const run = (context, req) => {

  const durationString: string = req.query && req.query.duration;
  const duration = durationString ? +durationString : DEFAULT_DURATION_SECONDS;

  let random = 0.0;
  let rounds = 0;

  var start = process.hrtime();

  while (process.hrtime(start)[0] < duration) {
    var nextRandom = randomizer();
    random = random + nextRandom - 0.5;
    rounds++;
  }

  context.res = createResponse(200, {
    region: process.env.azureRegion || "(local)", // Is there an easier way to obtain the region?
    provider: "azure",
    runtime: "nodejs",
    instanceId,
    duration,
    rounds,
    roundsPerSecond: Math.round(rounds / duration),
    result: Math.round(random)
  });

  context.done();
};

function createResponse(httpStatusCode: number, body: any): any {
  return {
    status: httpStatusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    isRaw: true
  };
}