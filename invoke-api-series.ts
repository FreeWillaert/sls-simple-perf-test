import * as _ from 'lodash';
import * as parseArgs from 'minimist';
import chalk from 'chalk';
import { readArgValue } from './util/readArgValue';
import { invokeApi } from './invokeApi';

const MEMORY_SIZES = [128, 256, 512];
const DURATIONS = [1,2,3];//4,5,6,7,8,9,10];
const PARALLELS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

(async function () {
    try {
        var argv = parseArgs(process.argv.slice(2));

        const apiUri: string = readArgValue(argv, "u", "uri");
        const iterations: number = +readArgValue(argv, "i", "iterations");

        console.log(`timestamp,region,provider,runtime,memorySize,parallel,duration,requestDuration,rpsMean,rpsStdev,rpsMin,rpsMedian,rpsMax,resultMean`);

        for(let memorySize of MEMORY_SIZES) {
            for(let duration of DURATIONS) {
                for(let parallel of PARALLELS) {
                    for(let i = 0; i<iterations;i++) {
                        // TODO: Should retrieve result from invokeApi and log it here instead.
                        try {
                            await invokeApi(apiUri, memorySize, duration, parallel);                            
                        } catch (error) {
                            console.error(`Error: ${error.message} for ${memorySize}/${duration}/${parallel}`)
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(chalk.red("Error: " + error.message));
        console.log(chalk.blue("Usage: invoke-api-series --uri=[API_URI] --iterations=[NUMBER OF ITERATIONS]"));
    }
})();

