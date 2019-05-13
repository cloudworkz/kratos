# kratos

```text
 __                   __
|  | ______________ _/  |_  ____  ______
|  |/ /\_  __ \__  \\   __\/  _ \/  ___/
|    <  |  | \// __ \|  | (  <_> )___ \
|__|_ \ |__|  (____  /__|  \____/____  >
     \/            \/                \/
```

## What

Collect and stream mulitple chunks of a large file into a Google Cloud Storage (File) Bucket.

## How

You will need two services, a running instance of this one and a client implementation, which basically requires an HTTP server with 3 endpoints.
You can find a sample client implementation in Java [here](https://github.com/cloudworkz/kratos-pendant).

Each transfer is handled in a "transaction" you can request such by calling the `POST: /api/transaction/run` (as mentioned below).
The service will then open up a stream to the GCS file (filename will be the transactinId) in the configured bucket, it will afterwards
walk through all the provided chunks e.g. `chunks: 2`, will result in 3 calls `/request/{transactionId}/chunk/0`, `/request/{transactionId}/chunk/1`
and `/request/{transactionId}/chunk/2` while streaming the response into the GCS file. During start and end of such transactions the `/start` and `/ack`
endpoints will be called in the service provider.

The service can handle multiple transactions at the same time, calling the endpoint `POST: /api/transaction/run` with the same transactionId again, will trigger no actions whatsoever, if the transaction is still running.

## Requirements

* Node.js >= 9.x.x (we suggest >= 11.x.x)

## Install

As simple as `yarn global add kratos-server`.

(_NOTE: In case you dont have yarn run `npm i -g yarn` first._)

## Run

`kratos-server "./baseConfig.js"`

You just have to throw in a config (JSON or JS).
[A base config is always used](bin/baseConfig.js), so you just have to overwrite
your specific requirements.

Check out `kratos-server -h` for other options.

## Using

With any HTTP client.

Checkout the API quick start or the setup infos below.

## API Quick Start

Basically there are two available api endpoints, `POST: /api/transaction/run` to run a transaction
and `GET: /api/transaction/status` to check all currently running transactions.

Triggering a sample transaction might look like this:

```bash
curl -X POST \
  http://localhost:1919/api/transaction/run \
  -H 'Content-Type: application/json' \
  -d '{
	"transactionId": "blablabla",
	"chunks": 3,
	"baseUrl": "http://localhost:8080",
	"extension": "parquet",
	"contentType": "application/octet-stream"
}'
```

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
