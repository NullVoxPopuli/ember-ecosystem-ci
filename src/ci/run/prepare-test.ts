import { getConfig, writeConfig } from "./-config.ts";
import { log, run, parseCommand, safeJoin } from "#utils";

export async function prepareTest() {
  let config = await getConfig();

  let { prepareTest: command, state } = config;
  let { cloneDir: dir } = state;


  if (!state.prepareTest) {
    if (!command) {
      config.state.prepareTest = 'not specified';
    } else {
      let prepare = parseCommand(command);

      let result = await run(prepare.run, safeJoin(dir, prepare.directory));

      config.state.prepareTest = result;
    }

    await writeConfig(config);
  }

  return config.state.prepareTest;
}

if (import.meta.filename === process.argv[1]) {
  console.info(`Preparing tests...`);
  await prepareTest();

  let config = await getConfig();
  log.inspect(config);

  if (!config.state.prepareTest) {
    console.error('BuiPreparing tsets failed');
    process.exit(1);
  }
}
