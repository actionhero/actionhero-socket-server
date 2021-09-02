# Actionhero Socket Server

[![test](https://github.com/actionhero/actionhero-socket-server/actions/workflows/test.yml/badge.svg)](https://github.com/actionhero/actionhero-socket-server/actions/workflows/test.yml)

As of Actionhero v21, the socket server is not included with Actionhero by default. You can add it (this package) via `npm install actionhero-socket-server`.

```shell
❯ telnet localhost 5000
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
{"welcome":"actionhero.welcomeMessage","context":"api"}
randomNumber
{"randomNumber":0.11296216329530862,"stringRandomNumber":"Your random number is 0.11296216329530862","context":"response","messageId":"8778822d-0953-4d0c-9c04-98cd53b53b7d"}
exit
{"status":"Bye","context":"api"}
Connection closed by foreign host.
```

## Installation

1. Add the package to your actionhero project: `npm install actionhero-socket-server --save`
2. Copy the config file into your project `cp ./node_modules/actionhero-socket-server/src/config/servers/socket.ts src/config/servers/socket.ts`
3. Enable the plugin:

```ts
// in config/plugins.ts
import * as path from "path";

export const DEFAULT = {
  plugins: () => {
    return {
      "actionhero-socket-server": {
        path: path.join(
          __dirname,
          "..",
          "..",
          "node_modules",
          "actionhero-socket-server"
        ),
      },
    };
  },
};
```

4. Add a serializer for errors:

```ts
// in config/errors.ts
// you are adding config.errors.serializers.socket

socket: error => {
  if (error.message) {
    return String(error.message);
  } else {
    return error;
  }
},
```

## Options

All options are exposed via the config file:

```ts
export const DEFAULT = {
  servers: {
    socket: (config) => {
      return {
        enabled: true,
        // TCP or TLS?
        secure: false,
        // Passed to tls.createServer if secure=true. Should contain SSL certificates
        serverOptions: {},
        // Port or Socket
        port: 5000,
        // Which IP to listen on (use 0.0.0.0 for all)
        bindIP: "0.0.0.0",
        // Enable TCP KeepAlive pings on each connection?
        setKeepAlive: false,
        // Delimiter string for incoming messages
        delimiter: "\n",
        // Maximum incoming message string length in Bytes (use 0 for Infinite)
        maxDataLength: 0,
      };
    },
  },
};
```
