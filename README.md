# ember-ecosystem-ci

This is a suite of slow, high-fidelity, nightly tests that ensure different aspects of the ember ecosystem continue to work.

## What's tested:

- ember-cli can generate new apps
- libraries continue to work with `ember-source#main` 
- apps continue to work with `ember-source#main` and `ember-cli#main` 

## Adding a new library / app

PR a change to `ecosystem-config.ts`, which adds an object that looks something like the following:
```ts
{
    name: 'package-majors',
    repo: 'https://github.com/NullVoxPopuli/package-majors.git',
    setup: 'pnpm install',
    test: 'pnpm test:ember'
}
```

if your project has tests in a sub-directory, your config may look something like this:
```ts 
{
    name: 'ember-resources',
    repo: 'https://github.com/NullVoxPopuli/ember-resources.git',
    setup: 'pnpm install; pnpm build',
    testDir: 'test-app',
    test: 'pnpm test:ember'
}
```


