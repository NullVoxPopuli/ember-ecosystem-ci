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
  let isMultiCommand = cmd.includes(';') || cmd.includes('&&');

  let realCommand = isMultiCommand ? `bash -c "${cmd}"` : cmd
  logRun(realCommand);

  try {
    let result = await execaCommand(realCommand,
      { cwd: inDir, stdio: 'inherit', preferLocal: true, shell: true });


    return result.exitCode === 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}


