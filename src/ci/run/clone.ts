import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfig, writeConfig } from "./-config.ts";
import { log, run } from "#utils";


export async function clone() {
  let config = await getConfig();

  let { repo, nodeVersion, state } = config;
  let { tmp, cleanedName, cloneDir: dir } = state;

  if (!state.clone) {
    await mkdir(dir, { recursive: true });
    await rm(dir, { force: true, recursive: true });

    let result = await run(`git clone ${repo} ${cleanedName}`, tmp);

    if (result && nodeVersion) {
      await writeFile(join(dir, '.prototools'), `node = "${nodeVersion}"\n`);
    }

    config.state.clone = result;

    await writeConfig(config);
  }

  return config.state.clone;
}


if (import.meta.filename === process.argv[1]) {
  console.info(`Cloning...`);
  await clone();

  let config = await getConfig();
  log.inspect(config);

  if (!config.state.clone) {
    console.error('Clone failed');
    process.exit(1);
  }
}
