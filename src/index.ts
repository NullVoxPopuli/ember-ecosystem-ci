import { inspect } from 'node:util';


export { writeOutput, pf, bool2Text, logRun, run } from './cli.ts';
export { all as prepare } from './build.ts';


export const log = {
  inspect(obj: any) {
    console.info(inspect(obj, true, null, true));
  }
}
