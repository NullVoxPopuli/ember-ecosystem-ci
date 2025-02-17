interface Entry {
  // This will show up in the CI matrix
  name: string;
  repo: string;
  setup: string;
  test: string;
}
export const config: Entry[] = [
  {
    name: 'package majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    test: 'pnpm test:ember'
  },
  {
  }

]
