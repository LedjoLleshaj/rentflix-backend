# Database installation

- PgAdmin password: admin
- Postgres user: postgres
- Postgres password: postgres

## Requirements

- Docker (https://docs.docker.com/install/)
- Docker Compose (https://docs.docker.com/compose/install/)

## Pre-installation

In the directory `postgres/entrypoint` make sure that every file has the read permission. If not, run the following command:

```bash
chmod +r postgres/entrypoint/*
```

Then the file `postgres/entrypoint/restore.sql` must have the execute permission. If not, run the following command:

```bash
chmod +x postgres/entrypoint/restore.sql
```

## Installation

Now we can build and run the development database `dvdrental` with the following command:

```bash
docker-compose up -d
```

## Post-installation

To open the PgAdmin interface, open a browser and go to `http://localhost:5050`. Then login with the following credentials:
password: postgres

To connect to the database, create a new server with the following credentials:

- host: `your ip address` < using **ifconfig**
- port: 5432
- username: postgres
- password: postgres

## Database postgres

This database is used by the application to store the data, in particular the data about users, in the development mode there are this users:

```text
username: test_0X (X is a number from 1 to 9)
password: test
customer_id: X (X is a number from 1 to 9)
```

The `customer_id` are the first 9 customers in the database.

## Note

Volumes have been unused since they are not necessary for the development database. If you want to use them, uncomment the related lines in the `docker-compose.yml` file.
