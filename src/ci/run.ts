import assert from 'node:assert';
import { readFile, cp, rm, mkdir, writeFile } from 'node:fs/promises';
import { config, type Entry } from '../../ecosystem-config.ts';
import { join } from 'node:path';
import { detectPackageManager } from "nypm";
import { prepare } from '#utils';
import { bool2Text, pf, run, writeOutput } from './utils.ts';
import { NAME } from '../args.ts';

let tmp = join(process.cwd(), 'tmp', 'tests');

const [, , filePath] = (process.argv);

assert(filePath, `expected the first arg to src/ci/run.ts to be passed. This should be the file path to the json config for thish test run`);

if (NAME) {
  let found = config.filter(entry => entry.name === NAME);

  assert(found, `Could not find ecosystem config with name: \`${NAME}\`.`);

  let str = JSON.stringify(found[0]);

  await writeFile(filePath, str);
}


let buffer = await readFile(filePath);
let str = buffer.toString();
let json = JSON.parse(str) as Entry;

let { repo, setup, test, testDir, name } = json;

let { source } = await prepare({ source: true });

let cleanedName = name.replaceAll(/[\s/\\|%^*()]/g, '-');
let dir = join(tmp, cleanedName);

await mkdir(dir, { recursive: true });
await rm(dir, { force: true, recursive: true });

let cloneResult = await run(`git clone ${repo} ${cleanedName}`, tmp);
let setupResult = await run(setup, dir);

let dirToTestIn = testDir ? join(dir, testDir) : dir;

let sourceTarget = join(dirToTestIn, 'ember-source.tgz');
console.log(
  `
Copying 
  ${source.tgz}
to
  ${sourceTarget}
`
);
await cp(source.tgz, sourceTarget);

// console.log({
//   tmp,
//   dir,
//   dirToTestIn,
//   repo,
//   testDir,
//   cleanedName,
//   source,
// })



/**
  * For now, all projects are pnpm, so we don't need to detect package manager
  */
let packageManager = await detectPackageManager(dir);

assert(packageManager, `Could not determine package manager in ${dir}`);

let installFromMainResult = await run(`${packageManager.name} add ${source.tgz}`, dirToTestIn);
// let installFromMainResult = await run(`pnpm add ${source.tgz}`, dirToTestIn);

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

await writeOutput({
  clone: bool2Text(cloneResult),
  setup: bool2Text(setupResult),
  'ember#main': bool2Text(installFromMainResult),
  test: bool2Text(testResult)
});

if (!isSuccess) {
  process.exit(1);
}


