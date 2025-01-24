import { processConfig } from '../src/processConfig';

async function seed() {
    await processConfig('src/sample.txt').catch(console.error);
}
