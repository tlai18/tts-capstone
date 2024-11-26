import { processConfig } from '../src/server/processConfig';

async function seed() {
    await processConfig('src/server/sample.txt').catch(console.error);
}

// Read the file path from the command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide the path to the firewall configuration file.");
  process.exit(1);
}