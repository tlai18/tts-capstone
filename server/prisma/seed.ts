import { processConfig } from '../src/server/processConfig';

async function seed() {
    await processConfig('src/server/sample.txt').catch(console.error);
}
