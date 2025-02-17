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

  try {
    let isMultiCommand = cmd.includes(';') || cmd.includes('&&');
    let result = await execaCommand(isMultiCommand ? `bash -c "${cmd}"` : cmd, { cwd: inDir, stdio: 'inherit', preferLocal: true, shell: true });


    return result.exitCode === 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}


