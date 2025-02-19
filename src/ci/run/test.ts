import { getConfig, writeConfig } from "./-config.ts";
import { log, run } from "#utils";


export async function test() {
  let config = await getConfig();

  let { test: testScript, state } = config;
  let { dirToTestIn } = state;

  if (!state.clone) {
    let result = await run(testScript, dirToTestIn);

    config.state.clone = result;

    await writeConfig(config);
  }

  return config.state.clone;
}


if (import.meta.filename === process.argv[1]) {
  console.info(`Running Tests...`);
  await test();

  let config = await getConfig();
  log.inspect(config);
}
