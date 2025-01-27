/**
 * @file processConfig.ts
 * @description This script reads a firewall configuration file provided as a command-line argument,
 *              parses each line to extract network objects and their attributes (like host, subnet,
 *              description), and then uses Prisma to insert the parsed data into a MongoDB database.
 *              It supports parsing standard configurations and handles additional configurations
 *              that start with a space.
 * @requires fs The Node.js File System module to handle file operations.
 * @requires readline The Node.js Readline module for reading from files line by line.
 * @requires @prisma/client Prisma Client for database operations.
 * @path src/processConfig.ts
 *
 * This script initializes a Readline interface to process each line of the provided configuration file.
 * It constructs objects based on the parsed data and inserts them into the database using Prisma.
 * The script is designed to be executed with Node.js and expects a file path as an input.
 *
 * Usage:
 * Run this script using 'ts-node' or 'npx ts-node'.
 * 
 * Arguments:
 * 1. [REQUIRED] The path to the firewall configuration file. '-f [file path]'
 * 2. The action to perform on the database [populate/update]. '-a [action]'. Defaults to 'update'.
 * 
 * Example run:
 * ts-node src/processConfig.ts -f src/server/sample.txt
 *
 * Example configuration lines:
 * object network Tufts-Management-172.20.0.0
 * subnet 172.20.0.0 255.255.0.0
 * host 130.64.25.50
 * description Added by script
 * 
 * These configurations are parsed to create and store objects in the MongoDB database.
 */

import fs from 'fs';
import readline from 'readline';
import yargs, { nargs } from 'yargs';
import { NetworkObject, Host, Prisma, PrismaClient } from '@prisma/client';
import { ObjectConfig } from './ObjectConfig';
import { sourceMapsEnabled } from 'process';

const prisma = new PrismaClient();

const processConfig = async (filePath: string): Promise<void> => {
    
  // Validate and reformat the file if necessary
  const [reformatted, formattedPath] = await validateReformatFile(filePath);
  console.log(formattedPath);
  const fileStream = fs.createReadStream(formattedPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentObject: ObjectConfig = {};
  let networkObjects: NetworkObject[] = [];
  let hosts: Host[] = [];

  for await (const line of rl) {
    if (line.startsWith('object network')) {
    //   if (currentObject.objectName) {
    //     console.log(currentObject);
    //     // const validObject = validateObjectConfig(currentObject);
    //     // if (validObject) {
    //     //   objects.push(validObject);
    //     // }
        
    //   }
    //   currentObject = { type: 'Network' };
    //   currentObject.objectName = parts[2];
    
        /* Currently, a single piece of data can span multiple lines.
         * It would be preferable to have a single line per object.
         * If not possible, this logic will have to be updated to be able to
         * read lines until you actually reach the end of a piece of data. */
        const parts = line.split(' ');
        console.log(parts);
        const desc = line.includes('description') ? line.split('description ')[1] : null;
        networkObjects.push({ name: parts[2] });
        if (parts[3] == "host") {
            hosts.push({objectNetwork: parts[2], host: parts[4], subnet: null, description: desc});
        }
      
    } else if (line.trim().startsWith('host ')) {
      const parts = line.trim().split(' ');
      currentObject.ipAddress = parts[1];
    } else if (line.trim().startsWith('subnet ')) {
      const parts = line.trim().split(' ');
      currentObject.networkAddress = parts[1];
      currentObject.subnetMask = parts[2];
    } else if (line.trim().startsWith('description ')) {
      currentObject.description = line.trim().substring(12);
    } else if (line.startsWith(' ')) {
      // Handle additional configuration details that start with a space
    }
  }
 
    if (args.action === 'populate') {
        // Insert all objects into the database
        await prisma.networkObject.createMany({
            data: networkObjects,
        });
        await prisma.host.createMany({
            data: hosts,
        });
    } else if (args.action === 'update') {
        // Update or insert all objects into the database
        await prisma.$transaction([
            ...networkObjects.map(networkObject =>
                prisma.networkObject.upsert({
                    where: { name: networkObject.name },
                    update: { },
                    create: { name: networkObject.name },
                })
            ),
            ...hosts.map(host =>
                prisma.host.upsert({
                    where: { objectNetwork: host.objectNetwork },
                    update: { host: host.host, subnet: host.subnet, description: host.description },
                    create: { objectNetwork: host.objectNetwork, host: host.host, subnet: host.subnet, description: host.description },
                })
            )
        ]);
    }
};

const validateObjectConfig = (config: ObjectConfig): ObjectConfig | null => {
  if (!config.objectName) {
    console.error("Validation error: 'objectName' is required");
    return null;
  }
  return config;
};

const objectTypes = ['object network', 'object-group', 'access-list'];

async function validateReformatFile(filePath: string): Promise<[boolean, string]> {
    let reformatted = false;
    let outputPath = filePath;
    
    const data = await fs.promises.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    let processedLines = [];
    let currentLine = '';
    
    for (let line of lines) {
        if (objectTypes.some(type => line.startsWith(type))) {
            if (currentLine.trim() !== '') {
                processedLines.push(currentLine);
            }
            currentLine = line;
        } else {
            currentLine += ' ' + line.trim();
            reformatted = true;
        }
    }
    
    if (currentLine.trim()) {
        processedLines.push(currentLine);
    }
    
    if (reformatted) {
        outputPath = filePath + ".reformatted";
        await fs.promises.writeFile(outputPath, processedLines.join('\n'));
        console.log('File processed and saved to', outputPath);
    }
    
    return [reformatted, outputPath];
}

const insertObject = async (data: ObjectConfig, table: String): Promise<void> => {
  try {
    console.log("Attempting to insert:", data);
  } catch (error) {
    console.error("Error inserting object:", data, error);
  }
};

// Read the file path from the command line arguments
// const filePath = process.argv[2];
// if (!filePath) {
//   console.error("Please provide the path to the firewall configuration file.");
//   process.exit(1);
// }

// const operation = process.argv[3] ? process.argv[3].toLowerCase() : 'update';
// if (!operation && operation != 'populate' && operation != 'update') {
//   console.error("Please provide a valid operation [populate/update] to perform.");
//   process.exit(1);
// }

// Read command line arguments
const args = yargs(process.argv.slice(2))
    .options({
        'action': {
            alias: 'a',
            describe: 'Action to perform [populate/demand] on the database',
            choices: ['populate', 'update'],
            type: 'string',
            default: 'update',
            nargs: 1,
        },
        'file': {
            alias: 'f',
            describe: 'Path to the firewall configuration file',
            type: 'string',
            demandOption: 'Please provide the path to the firewall configuration file.',
            nargs: 1,
        }
    })
    .parseSync();
    
processConfig(args.file).catch(console.error);

export { processConfig };