import { config, type Entry } from '#ecosystem-config';
import { CONFIG, FORCE, NAME } from '#args';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';


interface Config extends Entry {
  state: {
    configPath: string;
    tmp: string;
    clone: boolean;
    setup: boolean;
    test: boolean;
    useEmberMain: boolean;
    cleanedName: string;
    cloneDir: string;
    dirToTestIn: string;
  }
}


assert(NAME || CONFIG, `One of --name or --config is a required argument`)

if (NAME) {
  assert(!CONFIG, `Cannot set both --name and --config`);
}
if (CONFIG) {
  assert(!NAME, `Cannot set both --name and --config`);
}



export async function writeConfig(config: Config): Promise<void> {
  let filePath = config.state.configPath;

  assert(filePath, `Could not determine filePath in config. config.state may have incorrectly been constructed`);

  await writeFile(filePath, JSON.stringify(config, null, 2));
}

const READ_CACHE = new Map<string, Config>();

export async function getConfig(): Promise<Config> {
  let cwd = process.cwd();
  let state = join(cwd, 'tmp', 'state');
  let tmp = join(cwd, 'tmp', 'tests');

  await mkdir(state, { recursive: true });
  await mkdir(tmp, { recursive: true });


  let filePath = '';

  if (CONFIG) {
    filePath = CONFIG;
  } else if (NAME) {
    let cleaned = cleanName(NAME);
    filePath = join(state, cleaned + '.json');
  }

  let existing = READ_CACHE.get(filePath);

  if (existing) {
    return existing;
  }

  if (NAME) {
    let noPrior = !existsSync(filePath)
    if (FORCE || noPrior) {
      let found = config.filter(entry => entry.name === NAME);

      assert(found, `Could not find ecosystem config with name: \`${NAME}\`.`);

      let str = JSON.stringify(found[0]);

      await writeFile(filePath, str);
    }
  }

  let buffer = await readFile(filePath);
  let str = buffer.toString();
  let json = JSON.parse(str) as Partial<Config>;

  let name = json.name;
  assert(name, `JSON file at ${filePath} is missing the 'name' property`);

  let cleanedName = cleanName(name);
  let cloneDir = join(tmp, cleanedName);
  let testDir = json.testDir;

  let dirToTestIn = testDir ? join(cloneDir, testDir) : cloneDir;

  let result = {
    ...json,
    state: {
      clone: false,
      setup: false,
      test: false,
      useEmberMain: false,
      ...(json.state ?? {}),
      tmp,
      cleanedName,
      configPath: filePath,
      cloneDir,
      dirToTestIn,
    }
  } as Config;

  await writeConfig(result);

  READ_CACHE.set(filePath, result);

  return result;
}

function cleanName(name: string) {
  return name.replaceAll('@', '').replaceAll('/', '').replaceAll(/[\s/\\|%^*()]/g, '-');
}
