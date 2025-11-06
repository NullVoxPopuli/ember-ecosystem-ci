import { $, execaCommand } from "execa";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";
import { v4 as uuidv4 } from 'uuid';

export function pf(bool: boolean) {
  return bool ? styleText('green', 'pass') : styleText('red', 'fail');
}
export function bool2Text(bool: boolean) {
  return bool ? 'pass' : 'fail';
}


export async function writeOutput(data: any) {
  let outputDir = join(process.cwd(), 'output');
  let fileName = join(outputDir, uuidv4() + '.txt');

  await mkdir(outputDir, { recursive: true })
  await writeFile(fileName, JSON.stringify(data));
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
    let result = await $({
      cwd: inDir,
      stdio: 'inherit',
      preferLocal: true,
      shell: process.env[0] ?? true,
      /**
       * This is default, but just in case
       */
      env: {
        ...process.env,
      }
    })(realCommand);


    return result.exitCode === 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}


