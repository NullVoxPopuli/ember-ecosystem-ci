import { getConfig } from "./-config.ts";
import { $ } from "execa";


export async function verifyEmberSourceInstalled() {
  let config = await getConfig();

  let { dirToTestIn } = config.state;

  let result = false;

  try {
    let { stdout } = await $({ cwd: dirToTestIn })`npx --yes y-which ember-source`;

    console.log(stdout);
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
    console.log(`Could not determine that the above output included "canary"`);
    process.exit(1);
  }
}
