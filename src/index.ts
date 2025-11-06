import { join } from 'node:path';
import { inspect } from 'node:util';
import type { Command } from '../ecosystem-config.ts';


export { writeOutput, pf, bool2Text, logRun, run } from './cli.ts';
export { all as prepare } from './build.ts';


export const log = {
  inspect(obj: any) {
    console.info(inspect(obj, true, null, true));
  }
}

export function parseCommand(input: Command): { run: string; directory: string } {
  if (typeof input === 'string') {
    return {
      run: input,
      directory: '',
    };
  }

  return input;
}

export function safeJoin(x: string, y: string) {
  if (!y) {
    return x;
  }

  return join(x, y);
}
