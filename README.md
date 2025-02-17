# ember-ecosystem-ci

This is a suite of slow, high-fidelity, nightly tests that ensure different aspects of the ember ecosystem continue to work.

## What's tested:

- ember-cli can generate new apps
- libraries continue to work with `ember-source#main` 
- apps continue to work with `ember-source#main` and `ember-cli#main` 

## Adding a new library / app

- a new script per library app is needed in the `tests` directory, and then that should be invoked in CI in the appropriate workflow job location.


