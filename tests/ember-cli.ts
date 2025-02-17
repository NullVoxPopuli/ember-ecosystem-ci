import { prepare } from '#utils';
import { execaCommand } from 'execa';
import { join } from 'node:path';
import { styleText } from 'node:util';

let { cli } = await prepare({ cli: true, source: false });

const [, , ...args] = process.argv;
const bin = join(cli.dir, 'bin', 'ember');

const command = `${bin} new my-app ${args.join(' ')} --skip-install`

await execaCommand(command, { cwd: 'tmp' });


async function run(cmd: string) {
  console.info(`
    -------------------------------------
    Running: 
      ${cmd}
    -------------------------------------
  `)
  let promise = execaCommand(cmd, { cwd: 'tmp/my-app', stdio: 'inherit' });

  try {
    let result = await promise;

    return result.exitCode === 0;
  } catch (e) {
    return false;
  }
}

let manager = command.includes('--pnpm') ? 'pnpm' : 'npm';

let install = await run(`${manager} install`);
let lint = await run(`${manager} run lint`)
let lintFix = await run(`${manager} run lint:fix`)
let test = await run(`${manager} run test:ember`)
let prodbuild = await run(`${manager} run build`)


let isSuccess = [lint, lintFix, test, prodbuild].every(Boolean);

function pf(bool: boolean) {
  return bool ? styleText('green', 'pass') : styleText('red', 'fail');
}

console.info(`

  install    ${pf(install)}
  lint       ${pf(lint)}
  lint:fix   ${pf(lintFix)}
  test:ember ${pf(test)}
  build      ${pf(prodbuild)}

  Overall: ${isSuccess}
`);

if (!isSuccess) {
  process.exit(1);
}


