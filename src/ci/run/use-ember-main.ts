import { getConfig, writeConfig } from "./-config.ts";
import { join } from "node:path";
import { log, prepare, run } from "#utils";
import { cp } from "node:fs/promises";
import { detectPackageManager } from "nypm";
import assert from "node:assert";
import { existsSync } from "node:fs";
import { packageJson } from "ember-apply";

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

    let specifier = `file:${tgzPath}`;

    function mutateJson(json: any) {
      json.pnpm ||= {};
      json.pnpm.overrides ||= {};
      json.overrides ||= {};
      json.resolutions ||= {};

      json.pnpm.overrides['ember-source'] = specifier;
      json.overrides['ember-source'] = specifier;
      json.resolutions['ember-source'] = specifier;

      if (json.devDependencies?.['ember-source']) {
        json.devDependencies['ember-source'] = specifier;
      }
      if (json.dependencies?.['ember-source']) {
        json.dependencies['ember-source'] = specifier;
      }
    }

    await packageJson.modify(mutateJson, dir)

    if (dirToTestIn !== dir) {
      await packageJson.modify(mutateJson, dirToTestIn)
    }

    let isNpm = packageManager.name === 'npm';
    let isPnpm = packageManager.name === 'pnpm';
    let installMainCommand = `${packageManager.name} install ${isNpm ? '--force' : ''} ${isPnpm ? '--no-frozen-lockfile' : ''}`;

    let result = await run(installMainCommand, dirToTestIn);

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
