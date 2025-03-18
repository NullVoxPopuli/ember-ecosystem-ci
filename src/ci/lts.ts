import { str } from '#args';
import { prepare, bool2Text, logRun, pf, run, writeOutput } from '#utils';
import { execaCommand } from 'execa';
import assert from 'node:assert';
import { join } from 'node:path';

const TEST = str('--test');
const CLI_VERSION = str('--cli-version');
const DEV_DEPENDENCY = str('--devDependency');

assert(CLI_VERSION, `--cli-version is required`);

let cliBin = '';

if (CLI_VERSION === 'main') {
  let { cli } = await prepare({ cli: true, source: false });

  cliBin = cli.dir;
} else {
  cliBin = `npx ember-cli@${CLI_VERSION}`
}

assert(cliBin, `Could not determine the ember-cli bin`);

switch (TEST) {
  case 'ts': {
    let command = `${cliBin} new my-project --skip-install --typescript --pnpm`

    logRun(command);
    await execaCommand(command, { cwd: 'tmp' });


    let manager = 'pnpm';
    let install = await run(`${manager} update ${DEV_DEPENDENCY}`);
    let lint = await run(`${manager} run lint`)
    let lintFix = await run(`${manager} run lint:fix`)
    let test = await run(`${manager} run test:ember`)
    let prodbuild = await run(`${manager} run build`)


    let isSuccess = [lint, lintFix, test, prodbuild].every(Boolean);

    console.info(`

  install    ${pf(install)}
  lint       ${pf(lint)}
  lint:fix   ${pf(lintFix)}
  test:ember ${pf(test)}
  build      ${pf(prodbuild)}

  Overall: ${isSuccess}
`);


    await writeOutput({
      install: bool2Text(install),
      lint: bool2Text(lint),
      'lint:fix': bool2Text(lintFix),
      'test:ember': bool2Text(test),
      build: bool2Text(prodbuild)
    });

    if (!isSuccess) {
      process.exit(1);
    }

    break;
  }
  default: {
    throw new Error(`Unsupported: --test=${TEST}`);
  }
}




