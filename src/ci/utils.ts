import { execaCommand } from "execa";
import { styleText } from "node:util";

export function pf(bool: boolean) {
  return bool ? styleText('green', 'pass') : styleText('red', 'fail');
}

export function logRun(cmd: string) {
  console.info(`
    -------------------------------------
    Running: 
      ${cmd}
    -------------------------------------
  `)
}


export async function run(cmd: string, inDir = 'tmp/my-project') {
  logRun(cmd);
  let promise = execaCommand(cmd, { cwd: inDir, stdio: 'inherit' });

  try {
    let result = await promise;

    return result.exitCode === 0;
  } catch (e) {
    return false;
  }
}


