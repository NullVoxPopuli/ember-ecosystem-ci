import { getConfig, writeConfig } from "./-config.ts";
import { log, run, parseCommand, safeJoin } from "#utils";

export async function build() {
  let config = await getConfig();

  let { build: buildCommand, state } = config;
  let { cloneDir: dir } = state;


  if (!state.build) {
    if (!buildCommand) {
      config.state.build = 'not specified';
    } else {
      let build = parseCommand(buildCommand);

      let result = await run(build.run, safeJoin(dir, build.directory));

      config.state.build = result;
    }

    await writeConfig(config);
  }

  return config.state.build;
}

if (import.meta.filename === process.argv[1]) {
  console.info(`Building...`);
  await build();

  let config = await getConfig();
  log.inspect(config);

  if (!config.state.build) {
    console.error('Build failed');
    process.exit(1);
  }
}
