export type Command = string | {
  run: string;
  directory: string;
}
/**
 * Phase order specified in the GH workflows
 * 1. Clone
 * 2. Setup
 * 3. Build
 * 4. Install ember-source / apply try config
 * 5. Verify ember-source is correct
 * 6. Prepare Test
 * 7. Test
 */
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
  // Optionally, read the repo's try config, and merge with our local copy of dependencies
  // If specified, this is applied after build.
  try?: { scenarioName: string, directory?: string }
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
    testDir: 'test-app',
    test: 'pnpm test:ember',
    try: {
      directory: 'test-app',
      scenarioName: 'ember-canary',
    },
  },
  // Disabled because our CI's proto tool isn't active
  // when we invoke commands via execa
  // {
  //   name: 'warp-drive',
  //   repo: 'https://github.com/warp-drive-data/warp-drive.git',
  //   setup: 'pnpm install',
  //   build: 'pnpm prepare',
  //   prepareTest: { run: 'pnpm build:tests', directory: 'tests/framework-ember' },
  //   testDir: 'tests/framework-ember',
  //   test: 'pnpm test'
  // },
  {
    name: 'ember-page-title',
    repo: 'https://github.com/ember-cli/ember-page-title.git',
    setup: 'pnpm install',
    build: 'pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  /* {
    name: 'ember-provide-consume-context',
    repo: 'https://github.com/customerio/ember-provide-consume-context.git',
    setup: 'npm install',
    build: 'npm run build',
    testDir: 'test-app',
    test: 'npm exec ember test'
  }, */
  {
    name: 'package-majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    test: 'pnpm test:ember'
  },
  // Disabled because ember-cli is likely needs upgraded in this test app
  // {
  //   name: 'ember-resources',
  //   repo: 'https://github.com/NullVoxPopuli/ember-resources.git',
  //   setup: 'pnpm install',
  //   build: 'pnpm build',
  //   prepareTest: 'pnpm i -f',
  //   testDir: 'test-app',
  //   test: 'pnpm test'
  // },
  // Disabled because this repo needs a lot of maintenance to be green against canary
  // {
  //   name: 'ember-simple-auth',
  //   repo: 'https://github.com/mainmatter/ember-simple-auth.git',
  //   setup: 'pnpm install',
  //   build: { run: 'pnpm build', directory: 'packages/ember-simple-auth' },
  //   testDir: 'packages/test-app',
  //   test: 'pnpm test'
  // },
  {
    name: 'ember-intl',
    repo: 'https://github.com/ember-intl/ember-intl',
    setup: 'pnpm install',
    build: 'pnpm build',
    testDir: 'tests/ember-intl',
    test: 'pnpm test',
  },
]
