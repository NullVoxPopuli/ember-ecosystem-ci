import { getConfig, writeConfig } from "./-utils.ts";
import { run } from "../utils.ts";


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
}
