import { getConfig, writeConfig } from "./-config.ts";
import { join } from "node:path";
import { log, prepare, run } from "#utils";
import { cp } from "node:fs/promises";
import { detectPackageManager } from "nypm";
import assert from "node:assert";
import { existsSync } from "node:fs";


export async function useEmberMain() {
  let config = await getConfig();

  let { state } = config;
  let { dirToTestIn, cloneDir: dir } = state;

  if (!state.useEmberMain) {
    let { source } = await prepare({ source: true });

    let sourceTarget = join(dirToTestIn, 'ember-source.tgz');
    console.log(
      `
Copying 
  ${source.tgz}
to
  ${sourceTarget}
`
    );
    await cp(source.tgz, sourceTarget);


    /**
      * For now, all projects are pnpm, so we don't need to detect package manager
      */
    let packageManager = await detectPackageManager(dir);

    assert(packageManager, `Could not determine package manager in ${dir}`);

    const isWorkspaceRoot = existsSync(join(dirToTestIn, 'pnpm-lock.yaml'));


    let installMainCommand = `${packageManager.name} add ${source.tgz}`;
    if (isWorkspaceRoot) {
      installMainCommand += ' -w';
    }

    console.log({ isWorkspaceRoot, installMainCommand });

    let result = await run(installMainCommand, dirToTestIn);

    config.state.useEmberMain = result;

    await writeConfig(config);
  }

  return config.state.useEmberMain;
}


if (import.meta.filename === process.argv[1]) {
  console.info(`Setting up ember-source @ main...`);
  await useEmberMain();

  let config = await getConfig();
  log.inspect(config);

  if (!config.state.useEmberMain) {
    console.error('Installing ember-source @ main failed');
    process.exit(1);
  }
}
