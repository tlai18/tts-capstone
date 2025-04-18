import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from 'yargs';

const app = express();
const prisma = new PrismaClient();
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());

const corsOptions = {
    origin: [`https://${process.env.IP_ADDRESS}`, `http://${process.env.IP_ADDRESS}`],
    methods: 'GET,POST',
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Fetch Data from IP
app.post('/getData', async (req: Request, res: Response) => {
    const ip = req.body.ip;

    if (ip === undefined) {
        res.status(400).send("Bad Request: IP address is required in JSON format");
        return;
    }
  
    const hosts = await prisma.host.findMany({
        where: {
            host: ip,
        },
    });
  
    res.json(hosts);
});

app.get('/getUserInfo', async (req: Request, res: Response) => {
    const email = req.headers['mail'] as string;
    const uid = req.headers['uid'] as string;
    
    if (!email || !uid) {
        res.status(400).json({ error: 'User information is missing' });
        return;
    }
    try {
        res.json({ email, uid });
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
    

app.get('/hostsByEmail', async (req: Request, res: Response) => {
  const email = req.headers['mail'] as string;

  if (!email) {
    res.status(400).json({ error: 'Email parameter is required' });
    return;
  }

  try {
    // First find the owners by email
    const owners = await prisma.owner.findMany({
      where: {
        emails: {
          has: email.toLowerCase().trim(),
        }
      }
    });

    if (!owners) {
      res.status(404).json({ error: 'Owners not found with this email' });
      return;
    }

    // Now find all hosts associated with owners
    const ownersNames = owners.map(owner => owner.name);
    const hosts = await prisma.host.findMany({
      where: {
        ownerName: {
            in: ownersNames,
        }
      }
    });

    // Return the associated hosts
    res.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts by email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/ruleGroupsByHost', async (req: Request, res: Response) => {
  const { host } = req.query; // Extract the host from query parameters

  if (!host) {
    res.status(400).json({ error: 'Host parameter is required' });
    return; 
  }
  
  try {
    
    // Make sure the currently logged in user is an owner of the host
    const email = req.headers['mail'] as string;
    
    if (!email) {
      res.status(400).json({ error: 'User must be logged in with an email' });
      return; 
    }
    
    const owners = await prisma.owner.findMany({
      where: {
        emails: {
          has: email.toLowerCase().trim(),
        }
      }
    });
  
    if (!owners) {
      res.status(404).json({ error: 'Owners not found with this email' });
      return;
    }
  
    // Now find all hosts associated with owners
    const ownersNames = owners.map(owner => owner.name);
    const hosts = await prisma.host.findMany({
      where: {
        ownerName: {
            in: ownersNames,
        }
      }
    });
      
    const checkHost = hosts.find((h) => h.host === host);
    
    if (!checkHost) {
      res.status(403).json({ error: 'User is not authorized to access this host' });
      return; 
    }
    
    // Find the NetworkObject associated with the given Host
    const networkObject = await prisma.networkObject.findFirst({
      where: {
        host: {
          host: host as string, // Match the host field in the Host model
        },
      },
      include: {
        rules: true,
        networkGroups: true,
      }
    });

    if (!networkObject) {
      res.status(404).json({ error: 'No NetworkObject found for the given host' });
      return;
    }
    
    let networkGroupsSet: Set<string> = new Set();
    let ruleGroups: Set<number> = new Set();
    
    // Add all the RuleGroups that directly contain the NetworkObject
    for (const rule of networkObject.rules) {
      ruleGroups.add(rule.ruleGroupId);
    }

    const directNetworkGroups = await prisma.networkGroup.findMany({
      where: {
        networkObjects: {
          some: {
              networkObjectId: { equals: networkObject.name, },
          },
        },
      },
      include: {
        rules: true,
        parentNetworkGroups: true,
      }
    });
    
    // Add all the RuleGroups that contain the NetworkGroups which directly contain the NetworkObject
    for (const networkGroup of directNetworkGroups) {
      for (const rule of networkGroup.rules) {
        ruleGroups.add(rule.ruleGroupId);
      }
      networkGroupsSet.add(networkGroup.objectGroupNetwork);
      getParentNetworkGroups(networkGroup.objectGroupNetwork);
      
    }
    
    async function getParentNetworkGroups(networkGroupId: string) {

      const networkGroup = await prisma.networkGroup.findUnique({
        where: {
          objectGroupNetwork: networkGroupId as string,
        },
        include: {
          rules: true,
          parentNetworkGroups: true,
        }
      });
      
      if (!networkGroup) {
        res.status(404).json({ error: `Invalid NetworkGroup ID: ${networkGroupId}` });
        return; 
      }

      // Add all the RuleGroups that contain NetworkGroups which indirectly contain the NetworkObject
      for (const rule of networkGroup.rules) {
        ruleGroups.add(rule.ruleGroupId);
      }
    
      for (const parentNetworkGroup of networkGroup.parentNetworkGroups) {
        if (!networkGroupsSet.has(parentNetworkGroup.parentId)) {
          networkGroupsSet.add(parentNetworkGroup.parentId);
          getParentNetworkGroups(parentNetworkGroup.parentId);
        }
      }
    }

    const ruleGroupsArray = Array.from(ruleGroups);
    
    const detailedGroups = await Promise.all(
        ruleGroupsArray.map(async (id: number) => {
            const [rules, remarks] = await Promise.all([
                prisma.rule.findMany({
                    where: {
                        ruleGroupId: {
                            equals: id,
                        },
                    },
                }),
                prisma.remark.findMany({
                    where: {
                        ruleGroupId: {
                            equals: id,
                        },
                    },
                }),
            ]);
            return {
                id,
                remarks: remarks.map((r: any) => r.remark),
                rules: rules.map((rule: any) => ({
                    ruleGroupId: rule.ruleGroupId,
                    protocol: rule.protocol,
                    ruleType: rule.ruleType,
                    ruleBody: rule.ruleBody,
                })),
            };
        })
    );
    
    res.json(detailedGroups);
    
  } catch (error) {
    console.error('Error fetching RuleGroups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
