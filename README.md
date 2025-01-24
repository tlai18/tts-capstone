# tts-capstone

# Run with Docker

1. Download [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
2. Run `docker compose up --watch` from the root directory to start the server, database, and interface.
3. To use the terminal for the server, run `docker exec -it server sh`.
4. Inside the server terminal, run `npx prisma studio` to view the database studio or `npx prisma db push --force-reset && npx prisma db seed src/sample.txt` to import the sample file.

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

# Running the proof of concept

To set up all the components:
1. Start up a PostgreSQL database
2. Create a `.env` in the root directory with DATABASE_URL=[DATABASE URL]. View [Prisma documentation](https://www.prisma.io/dataguide/postgresql/short-guides/connection-uris) for more information on getting your database URL.
3. Run `npm install` to download dependencies for the backend server
4. Run `npx prisma studio` and navigate to http://localhost:5555 to view the current state of your database
5. Run `npm run start:server` to start the backend server
6. Navigate to frontend client directory with `cd client`
7. Run `npm install` to download dependencies for the frontend client
8. Run `npm run start` to start the client
9. Navigate to http://localhost:3000/proof to view the proof of concept page

To perform functions:
1. Navigate to root directory first to begin importing data.
2. Run `npx prisma db push --force-reset && npx prisma db seed [filename]` with [filename] being the path to the file containing the new firewall rule configs. A sample file is provided at the path `src/sample.txt`
3. In your web browser, navigate back to the proof of concept page at http://localhost:3000/proof
4. Copy any host from your Prisma studio at http://localhost:5555 and paste it in the User form. Hit enter and your information should pop up shortly!

