import * as fs from 'fs';
import * as _ from 'lodash';
import * as parseArgs from 'minimist';
import * as rp from 'request-promise-native';
import chalk from 'chalk';
import { readArgValue } from './util/readArgValue';
import { create } from 'domain';

const SUPPORTED_MEMORY_SIZES = [128, 256, 512];
const MAX_DURATION = 30;

(async function () {
    try {
        var argv = parseArgs(process.argv.slice(2));

        const apiUri: string = readArgValue(argv, "u", "uri");
        const memorySize: number = +readArgValue(argv, "m", "memorySize");
        const duration: number = +readArgValue(argv, "d", "duration");
        const parallel: number = +readArgValue(argv, "p", "parallel");

        // Some input validation.
        if (!_.includes(SUPPORTED_MEMORY_SIZES, memorySize)) throw new Error("Memory size not suuported: " + memorySize);
        if (!_.isInteger(duration)) throw new Error("Duration must be an integer: " + duration);
        if (duration > MAX_DURATION) throw new Error("Duration larger than maximum: " + duration);
        if (!_.isInteger(parallel)) throw new Error("Parallel must be an integer: " + parallel);
        if (parallel < 1) throw new Error("Parallel must be 1 or more: " + parallel);

        // Prepare requests
        const requestPromises: Promise<any>[] = [];
        for(var i = 0; i < parallel; i++) requestPromises.push(createRequestPromise(apiUri, memorySize, duration));

        // var allPromises = 
        await Promise
            .all(requestPromises)
            .then((results: IApiResponse[]) => {
                // TODO: Write details to a file.
                // Assume only 1 provider, runtime, duration
                var totalRoundsSum = 0;
                results.forEach(result => totalRoundsSum += result.totalRounds);
                var durationSum = results.length * results[0].duration;
                var averageRounds = totalRoundsSum/durationSum;
                console.log(`${results[0].provider},${results[0].runtime},${results[0].duration},${averageRounds}`);
            });
    } catch (error) {
        console.error(chalk.red("Error: " + error.message));
        console.log(chalk.blue("Usage: invoke-api --uri=[API_URI] --memorySize=[MEM_SIZE_IN_MB] --parallel=[NUMBER OF PARALLEL REQUESTS] --duration=[SECONDS_TO_RUN]"));
    }
})();


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
    provider: string;
    runtime: string;
    instanceId: string;
    duration: number;
    totalRounds: number,
    averageRounds: number;
}