# Apiary Explorer

The goal of Apiary Explorer is to provide a way for users to discover, explore, and more effectively participate in Aragon organizations.

It is an evolution of the now defunct daolist.io site developed and maintained by [@onbjerg](https://github.com/onbjerg). The project has been adopted under the 1Hive umbrella to continue our goal of helping open source communities thrive by making it easier for patrons to support promising open source projects and open source projects to attract and reward contributors. 

Unlike the core Aragon client, Apiary is designed to be user-centric rather than organization centric, enabling users to explore and participate in many organizations. Emphasis is placed on curation and discovery. Users will be able to browse and join orgs using 1Hive's Token Request app, Aragon Black's Fundraising app, or through Autark's project apps.

Organizations can be sorted and filter based on usage statistics (which apps are installed, activity level, amount of funding, or user profiles). We also plan to offer a user curated tagging system.

## Design

There are three components in Daolist:

### [worker](/worker)

The worker scrapes every transaction in every block to see if any transaction interacts with an official Aragon smart contract.

The worker then emits events internally, where different internal components react to them. An example would be an internal component that saves DAO information to the database

This pattern is built around the concept that Ethereum is basically one huge event sourcing mechanism, and that Daolist is just a read model.

#### Configuration

| Environment Variable | Description                                   | Default                       |
|----------------------|-----------------------------------------------|-------------------------------|
| **Database**         |                                               |                               |
| `MONGODB_URI`        | The URI of the MongoDB instance to connect to | `mongodb://localhost:27017`   |
| **Ethereum**         |                                               |                               |
| `ETH_NODE`           | The URI of the Parity node to connect to      | `wss://mainnet.daolist.io/ws` |
| **Cache**            |                                               |                               |
| `REDIS_URL`          | The URL of the Redis instance to connect to   | `redis://localhost:6379`      |
| **Misc**             |                                               |                               |
| `LOG_LEVEL`          | The log level                                 | `info`                        |

### [api](/api)

This API simply presents the state that the worker has built.

#### Configuration

| Environment Variable | Description                                   | Default                     |
|----------------------|-----------------------------------------------|-----------------------------|
| **Database**         |                                               |                             |
| `MONGODB_URI`        | The URI of the MongoDB instance to connect to | `mongodb://localhost:27017` |
| **Misc**             |                                               |                             |
| `PORT`               | The port to listen for requests on            | `3000`                      |
| `LOG_LEVEL`          | The log level                                 | `info`                      |

### [website](/website)

The explorer front-end itself, built in React with Aragon UI.

## Setup

```bash
# Clone the repository
git clone git@github.com:onbjerg/daolist
cd daolist

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

## Authors

Oliver Nordbjerg ([@onbjerg](https://github.com/onbjerg))
Luke Duncan ([@lkngtn](https://github.com/lkngtn))
