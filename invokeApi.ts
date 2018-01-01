import * as fs from 'fs';
import * as _ from 'lodash';
import * as rp from 'request-promise-native';
import * as math from 'mathjs';
import { create } from 'domain';

const SUPPORTED_MEMORY_SIZES = [128, 256, 512];
const MAX_DURATION = 30;

export async function invokeApi(apiUri: string, memorySize: number, duration: number, parallel: number) {
    // Basic input validation.
    if (!_.includes(SUPPORTED_MEMORY_SIZES, memorySize)) throw new Error("Memory size not suuported: " + memorySize);
    if (!_.isInteger(duration)) throw new Error("Duration must be an integer: " + duration);
    if (duration > MAX_DURATION) throw new Error("Duration larger than maximum: " + duration);
    if (!_.isInteger(parallel)) throw new Error("Parallel must be an integer: " + parallel);
    if (parallel < 1) throw new Error("Parallel must be 1 or more: " + parallel);

    // Prepare requests.
    const requestPromises: Promise<any>[] = [];
    for(var i = 0; i < parallel; i++) requestPromises.push(createRequestPromise(apiUri, memorySize, duration));

    const timestamp = new Date().toISOString();
    await Promise
        .all(requestPromises)
        .then((responses: IApiResponse[]) => {
            // TODO: Write details to a file.

            var allRoundsPerSecond = responses.map(r => r.roundsPerSecond);

            // For simplicity, all figures are rounded.
            const rpsMean: number = Math.round(math.mean(allRoundsPerSecond));
            const rpsStdev: number = Math.round(math.std(allRoundsPerSecond));
            const rpsMin: number = Math.round(math.min(allRoundsPerSecond));
            const rpsMedian: number = Math.round(math.median(allRoundsPerSecond));
            const rpsMax: number = Math.round(math.max(allRoundsPerSecond));

            // We're not really interested in resultMean, but calculate it anyway to help detect bad implementations.
            const resultMean: number = Math.round(math.mean(responses.map(r => r.result)));

            // Assume only 1 region, provider, runtime.

            console.log(`${timestamp},${responses[0].region},${responses[0].provider},${responses[0].runtime},${memorySize},${parallel},${duration},${rpsMean},${rpsStdev},${rpsMin},${rpsMedian},${rpsMax},${resultMean}`);
        });    
}

function createRequestPromise(apiUri: string, memorySize: number, duration: number): Promise<any> {
const requestUri = `${apiUri}/api/doit/${memorySize}`;

const requestOptions: any = {
    method: "GET",
    uri: requestUri,        
    qs: {
        duration: duration
    },
    json: true,
    simple: false
};

return rp(requestOptions);
}

interface IApiResponse {
region: string,
provider: string;
runtime: string;
instanceId: string;
duration: number;
rounds: number,
roundsPerSecond: number;
result: number;
}