import { prepare } from "#utils";
import { cp } from "fs/promises";

const { source } = await prepare({ source: true });

await cp(source.tgz, 'ember-source-main.tgz');
