import { getPackages } from "@manypkg/get-packages";
import { packageJson } from 'ember-apply';
import { getConfig, writeConfig } from "./-config.ts";
import { log, run } from "#utils";

export async function setup() {
  let config = await getConfig();

  let { setup: setupScript, state } = config;
  let { cloneDir: dir } = state;

  if (!state.setup) {
    /**
     * ember-data, has set "engines" for their packageManagers.
     * This makes interacting with them more difficult.
     * So, for all cloned repos now, we'll delete all engines .
     * entries in all package.jsons
     */
    let repoInfo = await getPackages(dir);
    for (let pkg of repoInfo.packages) {
      packageJson.modify(json => {
        delete json.engines
      }, pkg.dir)
    }

    let result = await run(setupScript, dir);

    config.state.setup = result;

    await writeConfig(config);
  }

  return config.state.clone;
}

if (import.meta.filename === process.argv[1]) {
  console.info(`Setting up...`);
  await setup();

  let config = await getConfig();
  log.inspect(config);
}
