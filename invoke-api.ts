import * as parseArgs from 'minimist';
import chalk from 'chalk';

import { readArgValue } from './util/readArgValue';
import { invokeApi } from './invokeApi';

(async function () {
    try {
        var argv = parseArgs(process.argv.slice(2));

        const apiUri: string = readArgValue(argv, "u", "uri");
        const memorySize: number = +readArgValue(argv, "m", "memorySize");
        const duration: number = +readArgValue(argv, "d", "duration");
        const parallel: number = +readArgValue(argv, "p", "parallel");

        await invokeApi(apiUri, memorySize, duration, parallel);

    } catch (error) {
        console.error(chalk.red("Error: " + error.message));
        console.log(chalk.blue("Usage: invoke-api --uri=[API_URI] --memorySize=[MEM_SIZE_IN_MB] --parallel=[NUMBER OF PARALLEL REQUESTS] --duration=[SECONDS_TO_RUN]"));
    }
})();