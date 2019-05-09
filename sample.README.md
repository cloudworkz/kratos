# kratos

> THIS IS WIP

```text
 __                   __
|  | ______________ _/  |_  ____  ______
|  |/ /\_  __ \__  \\   __\/  _ \/  ___/
|    <  |  | \// __ \|  | (  <_> )___ \
|__|_ \ |__|  (____  /__|  \____/____  >
     \/            \/                \/
```

## What

...

## How

...

## Why

...

## Requirements

* Node.js >= 9.x.x (we suggest >= 11.x.x)

## Install

As simple as `yarn global add kratos`.

(_NOTE: In case you dont have yarn run `npm i -g yarn` first._)

## Run

`kratos "./baseConfig.js"`

You just have to throw in a config (JSON or JS).
[A base config is always used](bin/baseConfig.js), so you just have to overwrite
your specific requirements.

Check out `kratos -h` for other options.

## Using

With any HTTP client.

Checkout the API quick start or the setup infos below.

## API Quick Start

...

## Setup Info

### Metrics

You can monitor this service via Prometheus at `/metrics`.

### Access Management

This service has build in access management.
You define tokens as keys in the configs http access object and set the topic names or special rights as string members of the key's array value.
A wildcard `*` grants all rights.

e.g.

```javascript
const config = {
  http: {
    access: {
      "token-for-admin": [ "*" ],
      "other-token": "*",
    },
  },
};
```

When making calls to the HTTP API the token is provided in the `authorization` header.

* `*` Allows every operation

Be aware that the default configuration is a wildcard for everything. (Meaning no token is required).
Never expose this service's HTTP interface publicly.

### Config via Environment Variables

It is possible to set a few config parameters (most in role of secrets) via environment variables. They will always overwrite the passed configuration file.

* `ACL_DEFINITIONS="mytoken=topic1,topic2;othertoken=topic3" roach-storm -l "./config.json"` -> turns into: `config.http.access.mytoken = [ "topic1", "topic2" ];`

## Maintainer

Christian Fröhlingsdorf [@chrisfroeh](https://twitter.com/chrisfroeh)

Build with :heart: :pizza: and :coffee: in cologne.
