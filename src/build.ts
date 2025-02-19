import { join, } from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { $ } from 'execa';
import assert from 'node:assert';

import { SKIP_BUILD } from '#args';

let tmp = join(process.cwd(), 'tmp', 'packages');

export interface Options {
  // false by default
  skipBuild?: boolean;
  // true by default
  cli?: boolean;
  // true by default
  source?: boolean;
  // false in CI, true out of CI
  inheritIO?: boolean;
}

interface BuildResult {
  dir: string;
  tgz: string;
}

function normalizeOptions(options: Options): Required<Options> {
  return {
    skipBuild: Boolean(SKIP_BUILD || options.skipBuild),
    cli: options.cli ?? true,
    source: options.source ?? true,
    inheritIO: options.inheritIO ?? (process.env.CI ? false : true),
  }
}

export async function source(options: Options) {
  let opts = normalizeOptions(options);
  if (!opts.source) return;

  await mkdir(tmp, { recursive: true });

  let dir = join(tmp, 'ember-source');

  if (!existsSync(dir)) {
    await $({ stdio: 'inherit', cwd: tmp })`git clone https://github.com/emberjs/ember.js.git ember-source`;
  }

  if (!(await hasTGZ(dir))) {
    if (!opts.skipBuild) {
      await $({ stdio: 'inherit', cwd: dir })`pnpm install`;
      await $({ stdio: 'inherit', cwd: dir })`node bin/build-for-publishing.js`;
    }
  }

  let files = await readdir(dir);
  let matches = files.filter(x => x.endsWith('.tgz'));
  let tgzFile = matches[0];

  assert(tgzFile, `Could not find tgz for ember-source in ${dir}`);

  let tgz = join(dir, tgzFile);

  return {
    dir: dir,
    tgz,
  }
}

export async function cli(options: Options) {
  let opts = normalizeOptions(options);
  if (!opts.cli) return;

  await mkdir(tmp, { recursive: true });

  let dir = join(tmp, 'ember-cli');

  if (!existsSync(dir)) {
    await $({ stdio: 'inherit', cwd: tmp })`git clone https://github.com/ember-cli/ember-cli.git ember-cli`;
  }

  if (!(await hasTGZ(dir))) {
    if (!opts.skipBuild) {
      await $({ stdio: 'inherit', cwd: dir })`pnpm install`;
      await $({ stdio: 'inherit', cwd: dir })`pnpm pack`;
    }
  }

  let files = await readdir(dir);
  let matches = files.filter(x => x.endsWith('.tgz'));
  let tgzFile = matches[0];

  assert(tgzFile, `Could not find tgz for ember-cli in ${dir}`);

  let tgz = join(dir, tgzFile);

  return {
    dir: dir,
    tgz,
  }
}


async function hasTGZ(dir: string) {
  let files = await readdir(dir);
  let matches = files.filter(x => x.endsWith('.tgz'));

  return Boolean(matches[0]);
}


type If<Condition, WhenTrue> = Condition extends true ? WhenTrue : undefined;
// type BestCase<Fn extends (...args: any[]) => any> = NonNullable<Required<ReturnType<Fn>>>;


export async function all<O extends Options>(options: O) {
  const results = await Promise.all([
    source(options),
    cli(options),
  ]);

  return {
    source: results[0] as If<O['source'], BuildResult>,
    cli: results[1] as If<O['cli'], BuildResult>,
  };

}
