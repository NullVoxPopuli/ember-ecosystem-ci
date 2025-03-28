import { str } from '#args';
import { prepare, bool2Text, logRun, pf, run, writeOutput } from '#utils';
import { execaCommand } from 'execa';
import assert from 'node:assert';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { packageJson } from 'ember-apply';


const TEST = str('--test');
const CLI_VERSION = str('--cli-version');
const DEV_DEPENDENCY = str('--devDependency');

assert(CLI_VERSION, `--cli-version is required`);

const tmp = join(process.cwd(), 'tmp');
let cliBin = '';

if (CLI_VERSION === 'main') {
  let { cli } = await prepare({ cli: true, source: false });

  cliBin = cli.dir;
} else {

  await mkdir(tmp, { recursive: true });
  cliBin = `npx ember-cli@${CLI_VERSION}`
}

assert(cliBin, `Could not determine the ember-cli bin`);

switch (TEST) {
  case 'ts': {
    let command = `${cliBin} new my-project --skip-install --typescript --pnpm`

    logRun(command);
    await execaCommand(command, { cwd: tmp });

    assert(DEV_DEPENDENCY, `--devDependency needed for this test`);

    let manager = 'pnpm';
    let install = await run(`${manager} update ${DEV_DEPENDENCY}`);

    let [devDep, version] = DEV_DEPENDENCY.split('@');

    assert(devDep, `Need a dep in --devDependency`);
    assert(version, `Need a version on --devDependency`);

    let [major, minor] = version.split('.');

    assert(major, `need major version`);
    assert(minor, `need minor version`);

    let depsToAdd: Record<string, string> = { [devDep]: version };

    if (parseInt(major, 10) <= 5 && parseInt(minor, 10) <= 4) {
      depsToAdd['@tsconfig/ember'] = '3.0.8';
    }

    if (CLI_VERSION.startsWith('5')) {
      depsToAdd['@ember/test-waiters'] = '^3.0.0';
      depsToAdd['@ember/test-helpers'] = '^4.0.0';
    }

    await packageJson.addDevDependencies(depsToAdd, join(tmp, 'my-project'));

    await run(`${manager} install --no-lockfile`);

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




