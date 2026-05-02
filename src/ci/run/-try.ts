import { join } from "node:path";
import { getConfig } from "./-config.ts";

const candidateNames = [
  'ember-alpha',
  'ember-canary',
];

const candidateFiles = [
  'config/ember-try.js',
  'config/ember-try.cjs',
];

const lastResorts = [`alpha`, `canary`];

export async function getTryDependencies(): Promise<void | Record<string, string>> {
  let config = await getConfig();

  if (!config.try) {
    return;
  }

  let sourceDirectory = config.try.directory || config.state.dirToTestIn;
  for (let candidateTry of candidateFiles) {
    let filePath = join(sourceDirectory, candidateTry);

    console.log({ filePath });

    let { default: fn } = await import(filePath);
    let tryConfig = await fn();

    let scenarios = tryConfig.scenarios;

    for (let candidateName of candidateNames) {
      for (let scenario of scenarios) {
        if (scenario.name === candidateName) {
          return scenario.npm?.devDependencies ?? {};
        }
      }
    }

    for (let lastResort of lastResorts) {
      for (let scenario of scenarios) {
        if (scenario.name.includes(lastResort)) {
          return scenario.npm?.devDependencies ?? {};
        }
      }
    }

  }
}
