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
    let filePath = join(config.state.cloneDir, sourceDirectory, candidateTry);

    console.log({ filePath });

    try {
      let { default: fn } = await import(filePath);
      var tryConfig = await fn();
    } catch (e) {
      console.info(`Error occurred while trying to see if ${filePath} is evaluatable`);
      console.error(e);
      return;
    }

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
