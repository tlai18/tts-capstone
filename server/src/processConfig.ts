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
 * ts-node src/processConfig.ts -o src/owners.csv -f src/sample.txt
 *  OR
 * npx ts-node src/processConfig.ts -o src/owners.csv -f src/sample.txt
 *
 * Example configuration file in sample.txt
 * 
 * These configurations are parsed to create and store objects in the MongoDB database.
 */

import fs from 'fs';
import readline from 'readline';
import csv from 'csv-parser';
import yargs, { nargs } from 'yargs';
import { NetworkObject, Host, Prisma, PrismaClient, PortGroup, NetworkGroupType, NetworkGroup, NetGrouptoNetObj, NetGrouptoNetGroup, Rule, RuleGroup, Remark, RuleToNetworkGroup, RuleToNetworkObject, Owner } from '@prisma/client';
import { ObjectConfig } from './ObjectConfig';
import { sourceMapsEnabled } from 'process';
import { getSystemErrorMap } from 'util';
import { resolve } from 'path';
import { rejects } from 'assert';

const prisma = new PrismaClient();

const processConfig = async (filePath: string): Promise<void> => {
  // Add owners to database
  const ipOwners = await insertOwners();
    
  // Validate and reformat the firewall rules file if necessary
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
  let portGroups: PortGroup[] = [];
  let networkGroups: NetworkGroup[] = [];
  let networkRelations: NetGrouptoNetObj[] = [];
  let netGroupRelations: NetGrouptoNetGroup[] = [];
  let ruleGroups: Map<number, RuleGroup> = new Map();
  let rules: Rule[] = [];
  let remarks: Remark[] = [];
  let ruleNetworks: Map<String, RuleToNetworkObject> = new Map();
  let ruleNetworkGroups: Map<String, RuleToNetworkGroup> = new Map();

  for await (const line of rl) {
    // Object definitions start with 'object network'
    if (line.startsWith('object network')) {
        const parts = line.trim().split(' ');
        const desc = line.includes('description') ? line.trim().split('description ')[1] : null;
        networkObjects.push({ name: parts[2]});
        if (parts[3] == "host") {
            hosts.push({objectNetwork: parts[2], host: parts[4], subnet: null, description: desc, ownerName: ipOwners.get(parts[4]) || null});
        } else if (parts[3] == "subnet") {
            const sn = line.trim().split('description ')[0].split('subnet ')[1];
            hosts.push({objectNetwork: parts[2], host: null, subnet: sn, description: desc, ownerName: null});
        }
      
    } // Service definitions (port groups) start with 'object-group service'
    else if (line.startsWith('object-group service')) {
        const parts = line.trim().split(' ');
        const name = parts[2];
        networkGroups.push({ objectGroupNetwork: name, description: null, type: NetworkGroupType.PORTS });
        const protocol = parts[3];
        if (parts[5] == 'range') {
            portGroups.push({name: name, protocol: protocol, startPort: parts[6], endPort: parts[7]});
        } else if (parts[5] == 'eq') {
            portGroups.push({name: name, protocol: protocol, startPort: parts[6], endPort: null});
        }
        if (line.includes('group-object')) {
            const ports = line.trim().split(/(?=group-object)/);
            for (let i = 1; i < ports.length; i++) {
                netGroupRelations.push({parentId: name, childId: ports[i].split('group-object ')[1].trim()});
            }
        }
    } // Group definitions start with 'object-group network'
    else if (line.startsWith('object-group network')) {
      const parts = line.trim().split(' ');
      const name = parts[2];
      const desc = line.includes('description') ? line.trim().split('description ')[1] : null;
      networkGroups.push({ objectGroupNetwork: name, description: desc, type: NetworkGroupType.HOSTS });
      const networks = line.trim().split(/(?=network-object object|group-object)/);
      for (let i = 1; i < networks.length; i++) {
        if (networks[i].includes('network-object object')) {
          networkRelations.push({networkGroupId: name, networkObjectId: networks[i].split('network-object object ')[1].trim()});
        } else if (networks[i].includes('group-object')) {
          netGroupRelations.push({parentId: name, childId: networks[i].split('group-object ')[1].trim()});
        }
      }
    } // Firewall rule definitions start with 'access-list CSM_FW_ACL_ advanced'
    else if (line.trim().startsWith('access-list CSM_FW_ACL_ advanced')) {
      const ruleGroupId = parseInt(line.split('rule-id ')[1].split(' ')[0]);
      ruleGroups.set(ruleGroupId, {ruleGroupId: ruleGroupId});
      const parts = line.trim().split(' ');
      const ruleType = parts[3];
      const protocol = parts[4];
      rules.push({ruleGroupId: ruleGroupId, ruleType: ruleType, protocol: protocol, ruleBody: line.trim()});
      const networks = line.trim().split(/(?=object-group|object)/);
      for (let i = 1; i < networks.length; i++) {
        if (networks[i].includes('object-group')) {
          const networkGroupId = networks[i].split(' ')[1].trim();
          ruleNetworkGroups.set(`${ruleGroupId}-${networkGroupId}`, {ruleGroupId: ruleGroupId, networkGroupId: networkGroupId});
        } else if (networks[i].includes('object')) {
          const networkObjectId = networks[i].split(' ')[1].trim();
          ruleNetworks.set(`${ruleGroupId}-${networkObjectId}`, {ruleGroupId: ruleGroupId, networkObjectId: networkObjectId});
        }
      }
    } // Firewall rule remarks start with 'access-list CSM_FW_ACL_ remark'
    else if (line.startsWith('access-list CSM_FW_ACL_ remark')) {
      const body = line.trim().split('rule-id ')[1];
      const idx = body.indexOf(':');
      const ruleId = parseInt(body.substring(0, idx));
      const remark = body.substring(idx + 1).trim();
      remarks.push({ruleGroupId: ruleId, remark: remark});
    }
  }
  
    
    const ruleGroupsArray = Array.from(ruleGroups.values());
    const ruleNetworkGroupsArray = Array.from(ruleNetworkGroups.values());
    const ruleNetworksArray = Array.from(ruleNetworks.values());
    const filteredRemarks = remarks.filter(remark => {
        if (!ruleGroups.has(remark.ruleGroupId)) {
            console.error(`No rule with id ${remark.ruleGroupId}. Remark \"${remark.remark}\" can't be added.`);
            return false;
        }
        return true;
    });
 
    if (args.action === 'populate') {
        // Insert all objects into the database
        await prisma.$transaction([
            prisma.networkObject.createMany({
                data: networkObjects,
            }),
            prisma.host.createMany({
                data: hosts,
            }),
            prisma.portGroup.createMany({
                data: portGroups,
            }),
            prisma.networkGroup.createMany({
                data: networkGroups,
            }),
            prisma.netGrouptoNetObj.createMany({
                data: networkRelations,
            }),
            prisma.netGrouptoNetGroup.createMany({
                data: netGroupRelations,
            }),
            prisma.ruleGroup.createMany({
                data: ruleGroupsArray,
            }),
            prisma.rule.createMany({
                data: rules,
            }),
            prisma.ruleToNetworkGroup.createMany({
                data: ruleNetworkGroupsArray,
            }),
            prisma.ruleToNetworkObject.createMany({
                data: ruleNetworksArray,
            }),
            prisma.remark.createMany({
                data: filteredRemarks,
            }),
        ]);
        
        
    } else if (args.action === 'update') {
        // Update or insert all objects into the database
        await prisma.$transaction([
            ...networkObjects.map(networkObject =>
                prisma.networkObject.upsert({
                    where: { name: networkObject.name },
                    update: {},
                    create: { name: networkObject.name},
                })
            ),
            ...hosts.map(host =>
                prisma.host.upsert({
                    where: { objectNetwork: host.objectNetwork },
                    update: { host: host.host, subnet: host.subnet, description: host.description, ownerName: host.ownerName },
                    create: { objectNetwork: host.objectNetwork, host: host.host, subnet: host.subnet, description: host.description, ownerName: host.ownerName },
                })
            ),
            ...portGroups.map(portGroup =>
                prisma.portGroup.upsert({
                    where: { name: portGroup.name },
                    update: { protocol: portGroup.protocol, startPort: portGroup.startPort, endPort: portGroup.endPort },
                    create: { name: portGroup.name, protocol: portGroup.protocol, startPort: portGroup.startPort, endPort: portGroup.endPort },
                })
            ),
            ...networkGroups.map(networkGroup =>
                prisma.networkGroup.upsert({
                    where: { objectGroupNetwork: networkGroup.objectGroupNetwork },
                    update: { description: networkGroup.description },
                    create: { objectGroupNetwork: networkGroup.objectGroupNetwork, description: networkGroup.description, type: networkGroup.type },
                })
            ),
            ...networkRelations.map(networkRelation =>
                prisma.netGrouptoNetObj.upsert({
                    where: { networkGroupId_networkObjectId: { networkGroupId: networkRelation.networkGroupId, networkObjectId: networkRelation.networkObjectId } },
                    update: {},
                    create: { networkGroupId: networkRelation.networkGroupId, networkObjectId: networkRelation.networkObjectId },
                })
            ),
            ...netGroupRelations.map(netGroupRelation =>
                prisma.netGrouptoNetGroup.upsert({
                    where: { parentId_childId: { parentId: netGroupRelation.parentId, childId: netGroupRelation.childId } },
                    update: {},
                    create: { parentId: netGroupRelation.parentId, childId: netGroupRelation.childId },
                })
            ),
            ...ruleGroupsArray.map(ruleGroup =>
                prisma.ruleGroup.upsert({
                    where: { ruleGroupId: ruleGroup.ruleGroupId },
                    update: {},
                    create: { ruleGroupId: ruleGroup.ruleGroupId },
                })
            ),
            ...rules.map(rule =>
                prisma.rule.upsert({
                    where: { ruleBody: rule.ruleBody },
                    update: {},
                    create: { ruleGroupId: rule.ruleGroupId, ruleType: rule.ruleType, protocol: rule.protocol, ruleBody: rule.ruleBody },
                })
            ),
            ...ruleNetworkGroupsArray.map(ruleNetworkGroup =>
                prisma.ruleToNetworkGroup.upsert({
                    where: { ruleGroupId_networkGroupId: { ruleGroupId: ruleNetworkGroup.ruleGroupId, networkGroupId: ruleNetworkGroup.networkGroupId } },
                    update: {},
                    create: { ruleGroupId: ruleNetworkGroup.ruleGroupId, networkGroupId: ruleNetworkGroup.networkGroupId },
                })
            ),
            ...ruleNetworksArray.map(ruleNetwork =>
                prisma.ruleToNetworkObject.upsert({
                    where: { ruleGroupId_networkObjectId: { ruleGroupId: ruleNetwork.ruleGroupId, networkObjectId: ruleNetwork.networkObjectId } },
                    update: {},
                    create: { ruleGroupId: ruleNetwork.ruleGroupId, networkObjectId: ruleNetwork.networkObjectId },
                })
            ),
            ...filteredRemarks.map(remark =>
                prisma.remark.upsert({
                    where: { remark_ruleGroupId: { ruleGroupId: remark.ruleGroupId, remark: remark.remark } },
                    update: { remark: remark.remark },
                    create: { ruleGroupId: remark.ruleGroupId, remark: remark.remark },
                })
            ),
        ]);
        
        // Delete all objects that no longer exist
        await prisma.remark.deleteMany({
            where: {
                NOT: {
                    OR: filteredRemarks.map(obj => ({
                        ruleGroupId: obj.ruleGroupId,
                        remark: obj.remark,
                    })),
                },
            },
        });
        await prisma.ruleToNetworkObject.deleteMany({
            where: {
                NOT: {
                    OR: ruleNetworksArray.map(obj => ({
                        ruleGroupId: obj.ruleGroupId,
                        networkObjectId: obj.networkObjectId,
                    })),
                },
            },
        });
        await prisma.ruleToNetworkGroup.deleteMany({
            where: {
                NOT: {
                    OR: ruleNetworkGroupsArray.map(obj => ({
                        ruleGroupId: obj.ruleGroupId,
                        networkGroupId: obj.networkGroupId,
                    })),
                },
            },
        });
        await prisma.rule.deleteMany({
            where: {
                NOT: {
                    ruleBody: {
                        in: rules.map(obj => obj.ruleBody),
                    },
                },
            },
        });
        await prisma.ruleGroup.deleteMany({
            where: {
                NOT: {
                    ruleGroupId: {
                        in: ruleGroupsArray.map(obj => obj.ruleGroupId),
                    },
                },
            },
        });
        await prisma.netGrouptoNetGroup.deleteMany({
            where: {
                NOT: {
                    OR: netGroupRelations.map(obj => ({
                        parentId: obj.parentId,
                        childId: obj.childId,
                    })),
                },
            },
        });
        await prisma.netGrouptoNetObj.deleteMany({
            where: {
                NOT: {
                    OR: networkRelations.map(obj => ({
                        networkGroupId: obj.networkGroupId,
                        networkObjectId: obj.networkObjectId,
                    })),
                },
            },
        });
        await prisma.networkGroup.deleteMany({
            where: {
                NOT: {
                    objectGroupNetwork: {
                        in: networkGroups.map(obj => obj.objectGroupNetwork),
                    },
                },
            },
        });
        await prisma.portGroup.deleteMany({
            where: {
                NOT: {
                    name: {
                        in: portGroups.map(obj => obj.name),
                    },
                },
            },
        });
        await prisma.host.deleteMany({
            where: {
                NOT: {
                    objectNetwork: {
                        in: hosts.map(obj => obj.objectNetwork),
                    },
                },
            },
        });
        await prisma.networkObject.deleteMany({
            where: {
                NOT: {
                    name: {
                        in: networkObjects.map(obj => obj.name),
                    },
                },
            },
        });
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

const insertOwners = async(): Promise<Map<string, string>> => {
    const ipsOwners = new Map<string, string>();
    const owners = new Map<string, Owner>();
    let prevName: string | null = null;
    
    return new Promise((resolve, reject) => {
        fs.createReadStream(args.owners)
        .pipe(csv(['name', 'email', 'ip']))
        .on('data', async (row) => {
            if (row.name && row.email) {
                prevName = row.name.trim();
                if (owners.has(row.name.trim())) {
                    if (!owners.get(row.name.trim())?.emails.includes(row.email.trim().toLowerCase())) {
                        owners.get(row.name.trim())?.emails.push(row.email.trim().toLowerCase());
                    }
                } else {
                    owners.set(row.name.trim(), {name: row.name.trim(), emails: [row.email.trim().toLowerCase()]});
                }
            } 
            if (prevName) {
                ipsOwners.set(row.ip.trim(), prevName);
            }
        })
        .on('end', () => {
            console.log('Owners CSV file successfully processed');
            // Insert owners with their emails into the database
            if (args.action === 'populate') {
                prisma.owner.createMany({
                    data: Array.from(owners.values())
                }).then(() => {
                    console.log('Owners added to the database');
                }).catch((error) => {
                    console.error('Error adding owners to the database: ', error);
                });
            } else if (args.action === 'update') {
                // Upsert all owners that still exist
                owners.forEach(async (owner) => {
                    await prisma.owner.upsert({
                        where: { name: owner.name },
                        update: { emails: owner.emails },
                        create: { name: owner.name, emails: owner.emails }
                    });
                });
                // Delete all owners that no longer exist
                prisma.owner.findMany()
                .then(async (existingOwners) => {
                    const existingOwnerNames = new Set(existingOwners.map(owner => owner.name));
                    owners.forEach(async (owner) => {
                        if (!existingOwnerNames.has(owner.name)) {
                            await prisma.owner.delete({
                                where: { name: owner.name }
                            });
                        }
                    });
                }).catch((error) => {
                    console.error('Error fetching existing owners: ', error);
                });
            }
            // Return the mappings of IPs to Owners
            resolve(ipsOwners);
        })
        .on('error', (error) => {
            console.error('Error processing owners CSV file:', error);
            reject(error);
        });
    });
}

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
        },
        'owners': {
            alias: 'o',
            describe: 'Path to the owners CSV file',
            type: 'string',
            demandOption: 'Please provide the path to the owners CSV file.',
            nargs: 1,
        }
    })
    .parseSync();
    
processConfig(args.file).catch(console.error);

export { processConfig };