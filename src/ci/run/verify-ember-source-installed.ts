import { getConfig } from "./-config.ts";
import { $ } from "execa";


export async function verifyEmberSourceInstalled() {
  let config = await getConfig();

  let { dirToTestIn } = config.state;

  let result = false;

  try {
    let { stdout } = await $({ cwd: dirToTestIn, stdio: 'inherit' })`npx --yes y-which ember-source`;

    result = (stdout || '').includes('canary');
  } catch (e) {
    result = false;
    console.error(e);
  }

  return result;
}


if (import.meta.filename === process.argv[1]) {
  console.info(`Verifying that ember-source @ main is installed...`);
  let result = await verifyEmberSourceInstalled();

  if (!result) {
    process.exit(1);
  }
}
