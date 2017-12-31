import * as _ from 'lodash';
import * as parseArgs from 'minimist';

export function readArgValue(argv: parseArgs.ParsedArgs, shortForm: string, longForm: string, defaultValue: any = null, errorMessage: string = null) : string {
    const parameterArg: string = argv[shortForm] || argv[longForm];
    if(_.isNull(defaultValue) && !parameterArg) {
        errorMessage = errorMessage || "Required argument not specified."
        throw new Error(`${errorMessage} (-${shortForm}, --${longForm}).`);
    } 
    return parameterArg;
}