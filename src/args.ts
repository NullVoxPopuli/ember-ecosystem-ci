import assert from "node:assert";

const [, , ...args] = process.argv;

export const SKIP_BUILD = bool('--skip-build');
export const NAME = str('--name');
export const CONFIG = str('--config');
export const FORCE = bool('--force');


console.log({
  '--skip-build': SKIP_BUILD,
  /**
   * name of the project and file per ecosystem config. State for repeat testing is located at:
   * tmp/state/$name.json
   */
  '--name': NAME,
  /**
   * Deletes any prior state when re-running tests before running again.
   */
  '--force': FORCE,
  /**
   * Use an existing config file instead of the --name file 
   */
  '--config': CONFIG,
});

function bool(name: string) {
  return args.includes(name);
}

function str(name: string) {
  let arg = args.find((a) => a.startsWith(name));

  return arg?.split('=')[1];
}

function int(name: string, defaultValue: number) {
  let arg = args.find((a) => a.startsWith(name));

  if (!arg) return defaultValue;

  let str = arg.split('=')[1];

  if (!str) return defaultValue;

  let num = parseInt(str, 10);

  if (isNaN(num)) return defaultValue;

  return num;
}
