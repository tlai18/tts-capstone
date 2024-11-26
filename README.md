# tts-capstone

# Project Setup Guide

To set up and run the project locally, follow these steps:

1. Ensure you have **Node.js** and **npm** installed on your system.
2. Clone the repository:
   'git clone https://github.com/tlai18/tts-capstone.git'

3. Navigate to the root directory and install dependencies:
    'npm install'

4. Start the server from the root directory:
    'npm run start:server'

5. To start the client, navigate to the client folder:
    'cd client &&npm run start'

6. Access and manage your database tables using Prisma Studio:
    'npx prisma studio'


Firewall Configuration Processor
This script, processConfig.ts, reads a firewall configuration file, parses each line to extract network objects and their attributes (like host, subnet, description), and inserts the parsed data into a MongoDB database using Prisma. It is built with TypeScript and Node.js, ensuring strong type safety and efficient data handling.

'npx ts-node src/server/processConfig.ts src/server/sample.txt'

# Resetting and importing the database

To quickly reset and update the database with a new file:

1. Navigate to the root directory and install dependencies

2. Run 'npx prisma db push --force-reset && npx prisma db seed [filename]' with [filename] being the path to the file containing the new firewall rule configs.
