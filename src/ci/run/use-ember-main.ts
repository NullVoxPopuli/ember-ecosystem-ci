import { getConfig, writeConfig } from "./-config.ts";
import { join } from "node:path";
import { log, prepare, run } from "#utils";
import { cp } from "node:fs/promises";
import { detectPackageManager } from "nypm";
import assert from "node:assert";
import { existsSync } from "node:fs";

const prebuiltTgzName = 'ember-source-main.tgz';

export async function useEmberMain() {
  let config = await getConfig();

  let { state } = config;
  let { dirToTestIn, cloneDir: dir } = state;

  if (!state.useEmberMain) {
    let prebuiltPath = join(process.cwd(), prebuiltTgzName);
    let doesExist = existsSync(prebuiltPath);

    let tgzPath = ''
    if (doesExist) {
      tgzPath = prebuiltPath;
    } else {
      let { source } = await prepare({ source: true });

      tgzPath = source.tgz;
    }

    let sourceTarget = join(dirToTestIn, 'ember-source.tgz');

    logCopy(sourceTarget, tgzPath);
    await cp(tgzPath, sourceTarget);


    /**
      * For now, all projects are pnpm, so we don't need to detect package manager
      */
    let packageManager = await detectPackageManager(dir);

    assert(packageManager, `Could not determine package manager in ${dir}`);

    const isWorkspaceRoot = existsSync(join(dirToTestIn, 'pnpm-lock.yaml'));
    const isDirWorkspaceRoot = existsSync(join(dir, 'pnpm-lock.yaml'));

    let installMainCommand = `${packageManager.name} add ${tgzPath}`;

    let result = true;

    if (dirToTestIn !== dir) {
      let cmd = installMainCommand;
      if (isDirWorkspaceRoot) {
        cmd += ' -w';
      }

      let resultA = await run(cmd, dir);

      result = result && resultA;
    }


    if (isWorkspaceRoot && dirToTestIn !== dir) {
      installMainCommand += ' -w';
    }

    let resultB = await run(installMainCommand, dirToTestIn);
    result = result && resultB;

    config.state.useEmberMain = result;

    await writeConfig(config);
  }

  return config.state.useEmberMain;
}

function logCopy(to: string, from: string) {
  console.log(
    `
Copying 
  ${from}
to
  ${to}
`
  );
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
