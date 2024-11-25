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
 * Run this script using 'ts-node' or 'npx ts-node' and provide the configuration file path as an argument:
 * ts-node src/processConfig.ts src/server/sample.txt
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
import { NetworkObject, Prisma, PrismaClient } from '@prisma/client';
import { ObjectConfig } from './ObjectConfig';

const prisma = new PrismaClient();

const processConfig = async (filePath: string): Promise<void> => {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentObject: ObjectConfig = {};
  var networkObjects: NetworkObject[] = [];

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
      const parts = line.split(' ');
    //   currentObject.objectName = parts[2];
      networkObjects.push({ name: parts[2] });
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

  await prisma.networkObject.createMany({data: networkObjects});
};

const validateObjectConfig = (config: ObjectConfig): ObjectConfig | null => {
  if (!config.objectName) {
    console.error("Validation error: 'objectName' is required");
    return null;
  }
  return config;
};

const insertObject = async (data: ObjectConfig, table: String): Promise<void> => {
  try {
    console.log("Attempting to insert:", data);
  } catch (error) {
    console.error("Error inserting object:", data, error);
  }
};

// Read the file path from the command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide the path to the firewall configuration file.");
  process.exit(1);
}

processConfig(filePath).catch(console.error);
