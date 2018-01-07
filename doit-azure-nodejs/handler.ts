import * as fs from 'fs';

const DEFAULT_MEMORY_SIZE = 128;
const DEFAULT_DURATION_SECONDS = 1;

const randomizer = Math.random;;
const instanceId = Math.round(randomizer() * 1000000000);

let dummyData: any = [];

let executionContext;

export const run = (context, req) => {
  executionContext = context;

  let instanceMemorySize = req.params && req.params.memorySize;
  if(!instanceMemorySize) {
    executionContext.log("Using default memory size " + DEFAULT_MEMORY_SIZE);
    instanceMemorySize = DEFAULT_MEMORY_SIZE;
  }
  consumeMemory(instanceMemorySize); 
  executionContext.log(`Consuming ${memoryUsage()} megabytes at start.`);
  
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

  executionContext.log(`Consuming ${memoryUsage()} megabytes at end.`);

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

function consumeMemory(instanceMemorySize: number) {
  while( memoryUsage() < (instanceMemorySize - 20)) {
    // dummyData.push(fs.readFileSync('dummyfile','utf-8'))
    dummyData.push((Array(5*1e6) as any).fill("X"));
    executionContext.log(`Now consuming ${memoryUsage()} megabytes...`);
  } 
}

// Returns memory (heap) usage in megabytes.
function memoryUsage() : number {
  return (process.memoryUsage().heapUsed / (1024 * 1024));
}