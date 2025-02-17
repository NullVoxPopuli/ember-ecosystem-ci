import assert from 'node:assert';
import { readFile, cp } from 'node:fs/promises';
import type { Entry } from '../../ecosystem-config.ts';
import { join } from 'node:path';
import { $, execaCommand } from 'execa';
import { prepare } from '#utils';
import { pf, run } from './utils.ts';

let { source } = await prepare({ source: true });

let tmp = join(process.cwd(), 'tmp', 'tests');

const [, , filePath] = (process.argv);

assert(filePath, `expected the first arg to src/ci/run.ts to be passed. This should be the file path to the json config for thish test run`);


let buffer = await readFile(filePath);
let str = buffer.toString();
let json = JSON.parse(str) as Entry;

let { repo, setup, test, testDir, name } = json;

let cleanedName = name.replaceAll(/\s/, '-');
let dir = join(tmp, cleanedName);

let cloneResult = await run(`git clone ${repo} ${cleanedName}`, tmp);
let setupResult = await run(setup, dir);


let dirToTestIn = testDir ? join(dir, testDir) : dir;

await cp(source.tgz, join(dirToTestIn, 'ember-source.tgz'));

/**
  * For now, all projects are pnpm, so we don't need to detect package manager
  */
let installFromMainResult = await run(`pnpm add ./ember-source.tgz`, dirToTestIn);

let testResult = await run(test, dirToTestIn);


let isSuccess = [cloneResult, setupResult, testResult, installFromMainResult].every(Boolean);

console.info(`

  ############################

    ${name}

  ############################

  clone        ${pf(cloneResult)}
  setup        ${pf(setupResult)}
  ember#main   ${pf(installFromMainResult)}
  test         ${pf(testResult)}

  Overall: ${isSuccess}
`);

if (!isSuccess) {
  process.exit(1);
}


