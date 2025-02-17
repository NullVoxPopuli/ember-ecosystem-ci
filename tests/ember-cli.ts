import { prepare } from '#utils';
import { execaCommand } from 'execa';
import { join } from 'node:path';

let { cli } = await prepare({ cli: true, source: false });

const [, , ...args] = process.argv;
const bin = join(cli.dir, 'bin', 'ember');

const command = `${bin} new my-app ${args.join(' ')}`

await execaCommand(command, { cwd: 'tmp' });

await execaCommand(`npm run lint`, { cwd: 'tmp/my-app' })
await execaCommand(`npm run lint:fix`, { cwd: 'tmp/my-app' })
await execaCommand(`npm run test`, { cwd: 'tmp/my-app' })
await execaCommand(`npm run build`, { cwd: 'tmp/my-app' })
