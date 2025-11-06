export type Command = string | {
  run: string;
  directory: string;
}
export interface Entry {
  // This will show up in the CI matrix
  name: string;
  // git URL to checkout the code
  repo: string;
  // What to do for install, any needed prebuild, etc
  setup: Command;
  // If preparation is needed after install, specify here
  build?: Command;
  // Sometimes tests need a build or some preparation before running
  prepareTest?: Command;
  // Comamnd to run for testing, must exit with status code 0 to indicate success
  test: string;
  // Optionally directory to run the 'test' command in.
  testDir?: string;
}
export const config: Entry[] = [
  {
    name: 'ember-qunit',
    repo: 'https://github.com/emberjs/ember-qunit.git',
    setup: 'pnpm install; ( cd addon && pnpm build )',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: '@ember/test-helpers',
    repo: 'https://github.com/emberjs/ember-test-helpers.git',
    setup: 'pnpm install',
    build: { directory: 'addon', run: 'pnpm build' },
    prepareTest: 'pnpm i -f',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'crates.io',
    repo: 'https://github.com/rust-lang/crates.io.git',
    setup: 'pnpm install',
    test: 'pnpm test'
  },
  {
    name: 'warp-drive',
    repo: 'https://github.com/warp-drive-data/warp-drive.git',
    setup: 'pnpm install',
    build: 'pnpm prepare',
    prepareTest: { run: 'pnpm build:tests', directory: 'tests/framework-ember' },
    testDir: 'tests/framework-ember',
    test: 'pnpm test'
  },
  {
    name: 'ember-page-title',
    repo: 'https://github.com/ember-cli/ember-page-title.git',
    setup: 'pnpm install',
    build: 'pnpm build',
    prepareTest: 'pnpm i -f',
    testDir: 'test-app',
    test: 'pnpm ember test'
  },
  {
    name: 'ember-provide-consume-context',
    repo: 'https://github.com/customerio/ember-provide-consume-context.git',
    setup: 'npm install',
    build: 'npm run build',
    testDir: 'test-app',
    test: 'npm exec ember test'
  },
  {
    name: 'package-majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-resources',
    repo: 'https://github.com/NullVoxPopuli/ember-resources.git',
    setup: 'pnpm install',
    build: 'pnpm build',
    prepareTest: 'pnpm i -f',
    testDir: 'test-app',
    test: 'pnpm test'
  },
  {
    name: 'ember-simple-auth',
    repo: 'https://github.com/mainmatter/ember-simple-auth.git',
    setup: 'pnpm install',
    build: { run: 'pnpm build', directory: 'packages/ember-simple-auth' },
    testDir: 'packages/test-app',
    test: 'pnpm test'
  },
]
