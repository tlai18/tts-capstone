# tts-capstone

# .env file format
```
POSTGRES_PASSWORD=change_this
POSTGRES_USER=change_this
POSTGRES_DB=change_this
IP_ADDRESS="http://localhost"
```

# Run with Docker

1. Download [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
2. Run `docker compose up -d` or `docker-compose up -d` from the root directory to start the server, database, and interface.
3. To use the terminal for the server, run `docker exec -it server sh`.
4. Inside the server terminal, run `npx prisma studio` to view the database studio or `npx prisma db push --force-reset && npx prisma db seed src/sample.txt` to import the sample file.

# Interacting with the database

- All commands to interact with the database should be run inside the docker server terminal
  - `docker exec -it server sh`
- To quickly reset and update the database with a new file:
  - Run `npx prisma db push --force-reset && npx prisma db seed [filename]` with [filename] being the path to the file containing the new firewall rule configs.
- To update the database with a valid file (more resource intensive when running on AWS. might overload the EC2 instance.):
  - Run `npx ts-node src/processConfig.ts -o src/owners.csv -f [filename]` with [filename] being the path to the file containing the updated firewall rule configs.
- To view the database:
  - Run `npx prisma studio` and navigate to [host]:5555

