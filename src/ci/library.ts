import { prepare } from '#utils';
import { execaCommand } from 'execa';
import { join } from 'node:path';
import { logRun, pf, run } from './utils.ts';

let { cli } = await prepare({ cli: true, source: false });

const [, , ...args] = process.argv;
const bin = join(cli.dir, 'bin', 'ember');

const command = `${bin} addon my-project --blueprint @embroider/addon-blueprint ${args.join(' ')} --skip-install`


logRun(command);
await execaCommand(command, { cwd: 'tmp' });


let manager = command.includes('--pnpm') ? 'pnpm' : 'npm';

// NPM doesn't work with pre-releases
let install = await run(`${manager} install ${manager === 'npm' ? '--force' : ''}`);
let lint = await run(`${manager} run lint`)
let lintFix = await run(`${manager} run lint:fix`)
let prodbuild = await run(`${manager} run build`)
let test = await run(`${manager} run test:ember`)

let isSuccess = [lint, lintFix, test, prodbuild].every(Boolean);

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


