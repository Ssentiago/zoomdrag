import { OutputOptions, rollup, RollupOptions } from 'rollup';

import config from './rollup.config';

async function debug() {
    console.log('Starting rollup with config:', config);
    const bundle = await rollup(config as RollupOptions);

    await bundle.write(config.output as OutputOptions);

    await bundle.close();
}

debug().catch(console.error);
