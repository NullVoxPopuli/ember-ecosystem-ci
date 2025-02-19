import { bool2Text, pf, writeOutput } from '#utils';
import { getConfig } from './ci/run/-config.ts';
import { clone } from './ci/run/clone.ts';
import { setup } from './ci/run/setup.ts';
import { useEmberMain } from './ci/run/use-ember-main.ts';
import { runTests } from './ci/run/test.ts';
import { verifyEmberSourceInstalled } from './ci/run/verify-ember-source-installed.ts';


let config = await getConfig();

let { name } = config;


let cloneResult = await clone();
let setupResult = await setup();
let installFromMainResult = await useEmberMain();

await verifyEmberSourceInstalled();

let testResult = await runTests();

let isSuccess = [cloneResult, setupResult, testResult, installFromMainResult].every(Boolean);

console.info(`

  ############################

    ${name}

  ############################

  clone        ${pf(cloneResult)}
  setup        ${pf(setupResult)}
  ember#main   ${pf(installFromMainResult)}
  test         ${pf(testResult)}

  Overall: ${pf(isSuccess)}
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


