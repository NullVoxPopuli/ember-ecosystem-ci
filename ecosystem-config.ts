export interface Entry {
  // This will show up in the CI matrix
  name: string;
  // git URL to checkout the code
  repo: string;
  // What to do for install, any needed prebuild, etc
  setup: string;
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
    setup: 'pnpm install; ( cd addon && pnpm build )',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-page-title',
    repo: 'https://github.com/ember-cli/ember-page-title.git',
    setup: 'pnpm install; pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-provide-consume-context',
    repo: 'https://github.com/customerio/ember-provide-consume-context.git',
    setup: 'pnpm install; pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'package-majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-resources',
    repo: 'https://github.com/NullVoxPopuli/ember-resources.git',
    setup: 'pnpm install; pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-simple-auth',
    repo: 'https://github.com/mainmatter/ember-simple-auth.git',
    setup: 'pnpm install',
    testDir: 'packages/test-app',
    test: 'pnpm test'
  },
  // {
  //   name: '@sentry/ember',
  //   repo: 'https://github.com/getsentry/sentry-javascript.git',
  //   setup: 'pnpm install',
  //   testDir: 'packages/ember',
  //   test: 'pnpm test'
  // },
]
