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
    name: 'package majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    test: 'pnpm test:ember'
  },
  {
    name: 'ember-resources',
    repo: 'https://github.com/NullVoxPopuli/ember-resources.git',
    setup: 'pnpm install; pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
  }
]
