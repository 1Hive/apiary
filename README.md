> ⚠️ If you are looking for the Apiary paper, it has been moved to the [apiary-paper](https://github.com/1hive/apiary-paper) repo.

> ℹ️ This document is for the newest unstable version of Apiary. If you're looking for the released version, click [here](https://github.com/1Hive/apiary/releases/latest).

# Apiary Explorer

![Screenshot of Apiary](.github/screenshot.png)

The goal of Apiary Explorer is to provide a way for users to discover, explore, and more effectively participate in Aragon organizations.

It is an evolution of the now defunct daolist.io and site developed and maintained by [@onbjerg](https://github.com/onbjerg) and the Apiary curation market proposal described [here](https://github.com/1hive/apiary-paper) that has since been partially implemented as Aragon Fundraising. The project has been adopted under the 1Hive umbrella to continue our goal of helping open source communities thrive by making it easier for patrons to support promising open source projects and open source projects to attract and reward contributors.

Apiary is designed to be user-centric rather than organization centric, enabling users to explore and participate in many organizations. Emphasis is placed on curation and discovery. Organizations can be sorted and filter based on usage statistics (which apps are installed, activity level, amount of funding, or user profiles). We also plan to offer a user curated tagging system.

## Design

There are four components in Apiary:

### [taskmaster](/taskmaster)

![Taskmaster Build Status](https://github.com/1Hive/apiary/workflows/Taskmaster%20CI/badge.svg)

The taskmaster schedules tasks for a range of Ethereum blocks onto a queue.

Tasks might be dependent on other tasks, forming a hierarchical block processing pipeline.

Tasks are then processed by one or more workers.

#### Configuration

| Environment Variable | Description                                                                                      | Default                       |
| -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Database**         |                                                                                                  |                               |
| `MONGODB_URI`        | **Required**. The URI of the MongoDB instance to connect to                                      | `mongodb://localhost:27017`   |
| **Ethereum**         |                                                                                                  |                               |
| `START_BLOCK`        | The block to start working from.                                                                 | `6592900`                     |
| `TARGET_BLOCK`       | The block to stop working after. If you specify `latest`, the worker will run indefinitely.      | `latest`                      |
| **Cache / Queue**    |                                                                                                  |                               |
| `REDIS_URL`          | **Required**. The URL of the Redis instance to connect to                                        | `redis://localhost:6379`      |
| **IPFS**             |                                                                                                  |                               |
| `ETH_EVENTS_URI`     | **Required**. The URI of the eth.events database to connect to.                                  |                               |
| **Misc**             |                                                                                                  |                               |
| `LOG_LEVEL`          | The log level                                                                                    | `info`                        |
| `DELAY`              | A delay in milliseconds between scheduling tasks for a block. This is useful if the taskmaster is scheduling blocks faster than the workers can process them, as that might make Redis run out of memory. | None (no delay)                        |

### [worker](/worker)

![Worker Build Status](https://github.com/1Hive/apiary/workflows/Worker%20CI/badge.svg)

The worker pulls tasks from a queue and transforms blocks, logs, transactions and traces in to explorable data.

This pattern is built around the concept that Ethereum is basically one huge event sourcing mechanism, and that Apiary is just a read model.

#### Logging

The worker outputs logs in JSONL format. To make the logs readable you can run the worker like this:

```sh
npm start | npx pino-pretty-min
```

If you're running Apiary using Docker Compose, you can do the same thing by running:

```sh
docker logs -f (docker-compose ps -q worker) | npx pino-pretty-min
```

#### Configuration

| Environment Variable | Description                                                                                      | Default                       |
| -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Database**         |                                                                                                  |                               |
| `MONGODB_URI`        | **Required**. The URI of the MongoDB instance to connect to                                      | `mongodb://localhost:27017`   |
| **Ethereum**         |                                                                                                  |                               |
| `ETH_NODE`           | **Required**. The URI of the Ethereum node to connect to                                         | `wss://mainnet.eth.aragon.network/ws` |
| **Cache / Queue**    |                                                                                                  |                               |
| `REDIS_URL`          | **Required**. The URL of the Redis instance to connect to                                        | `redis://localhost:6379`      |
| **IPFS**             |                                                                                                  |                               |
| `IPFS_URL`           | **Required**. The URL of the IPFS gateway to fetch files from                                    |                               |
| **IPFS**             |                                                                                                  |                               |
| `ETH_EVENTS_URI`     | **Required**. The URI of the eth.events database to connect to.                                  |                               |
| **Misc**             |                                                                                                  |                               |
| `LOG_LEVEL`          | The log level                                                                                    | `info`                        |
| `CONCURRENCY`        | The maximum number of tasks a worker can process concurrently.                                   | `5`                           |

### [api](/api)

![API Build Status](https://github.com/1Hive/apiary/workflows/API%20CI/badge.svg)

A GraphQL API. Interactive documentation for the API is available if you visit the endpoint in the browser.

#### Configuration

| Environment Variable | Description                                                 | Default                     |
| -------------------- | ----------------------------------------------------------- | --------------------------- |
| **Database**         |                                                             |                             |
| `MONGODB_URI`        | **Required**. The URI of the MongoDB instance to connect to | `mongodb://localhost:27017` |
| `MONGODB_NAME`       | The name of the MongoDB database to connect to              | `daolist`                   |
| **Misc**             |                                                             |                             |
| `PORT`               | The port to listen for requests on                          | `3000`                      |
| `LOG_LEVEL`          | The log level                                               | `info`                      |

### [website](/website)

![Website Build Status](https://github.com/1Hive/apiary/workflows/Website%20CI/badge.svg)

The explorer front-end itself, built in React with Aragon UI.

#### Configuration

| Environment Variable | Description                                                 | Default                     |
| -------------------- | ----------------------------------------------------------- | --------------------------- |
| `API_URL`            | The URI of the GraphQL API to connect to                    | `https://daolist.1hive.org` |

## Setup

```bash
# Clone the repository
git clone git@github.com:1Hive/apiary
cd apiary

# Install the dependencies
for dir in ./*; do (cd "$dir" && npm i); done

# Start the components
for dir in ./*; do (cd "$dir" && npm start); done
```

Alternatively you can use Docker Compose:

```sh
docker-compose up
```

The API will be available at localhost:3000 and the website will be available at localhost:8888.

## Release

- The API can be found at https://daolist.1hive.org
- The website can be found at https://apiary.1hive.org

## Contributing

Please review the [code of conduct](./.github/CODE_OF_CONDUCT.md)

## License

GPLv3

## Authors

- Oliver Nordbjerg ([@onbjerg](https://github.com/onbjerg))
- Luke Duncan ([@lkngtn](https://github.com/lkngtn))
