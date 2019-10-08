# Contributing to Apiary 🐝

Thank you for taking the time to contribute! 🎉

This document is a set of guidelines for contributing to Apiary in various ways. These are mostly guidelines, not rules, and as such use your best judgement and feel free to propose changes to this document in a pull request.

### Table of Contents

- [What should I know before contributing?][before-contributing]
- [How can I contribute?][how-do-contribute]
  - [Suggesting Features][feature-request]
  - [Bug Reports][bug-report]
  - [Writing Code][technical]
- [Style Guidelines][style-guidelines]
  - [Git Commit Messages][sg-git]
  - [JavaScript][sg-js]

## What should I know before contributing?

![high level overview](https://i.imgur.com/Q5xcAcY.png)

Apiary is made up of three components:

- [The worker][worker-src] processes Ethereum blocks and indexes relevant information in a MongoDB database
- [The API][api-src] is a GraphQL API that serves as the data access layer for any application that might want the data indexes by the worker
- [The website][website-src] is the primary consumer of the API and serves as a dashboard/explorer for Aragon organisations and related concepts

The split in to three components was very intentional, since downtime on either of the three components does not affect downtime on the remaining ones.

This split also means that contributing to Apiary can be a bit difficult, so before contributing, ask these questions:

- **Where is my feature/bug/enhancement residing?** It might be that your feature or bug resides in multiple components.
- **Is there already an issue open for this bug/feature?** Please check the [issue tracker][issues] before opening a new one.
- **Is someone already working on this bug/feature?** Bugs and features that are being worked on have an open issue and an assigned contributor.

If you have any trouble finding answers to these questions, please reach out to us on [Keybase][keybase] in the ``#apiary`` channel.

## How can I contribute?

There are multiple ways to contribute to Apiary:

- ✨ [Submit a feature request][feature-request] if you have an idea that will increase the value of Apiary
- 🐛 [Submit a bug report][bug-report] if something isn't working
- 💻 [By writing code][technical].

### Suggesting Features

### Bug Reports

### Writing Code

![indexing](https://i.imgur.com/6TF2JWC.png)

## Style Guidelines

### Git Commit Messages

We don't have any special conventions for commit messages, except you should follow the seven rules of a great commit mesage:

- [Separate subject from body with a blank line][git-7-separate]
- [Limit the subject line to 50 characters][git-7-limit-50]
- [Capitalize the subject line][git-7-capitalize]
- [Do not end the subject line with a period][git-7-end]
- [Use the imperative mood in the subject line][git-7-imperative]
- [Wrap the body at 72 characters][git-7-wrap-72]
- [Use the body to explain what and why vs. how][git-7-why-not-how]

We also greatly appreciate comitting often, but logically! 🙇 If your history gets messy, please consider [squashing your commits][git-squashing].

### JavaScript

We follow the [JavaScript Standard Style][standard-js].

[feature-request]: #
[bug-report]: #
[technical]: #

[worker-src]: #
[api-src]: #
[website-src]: #

[issues]: #

[keybase]: #

[git-squashing]: #

[standard-js]: https://standardjs.com/
