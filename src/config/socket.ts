const namespace = "socket";

declare module "actionhero" {
  export interface ActionheroConfigInterface {
    [namespace]: ReturnType<(typeof DEFAULT)[typeof namespace]>;
  }
}

export const DEFAULT = {
  [namespace]: () => {
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
};

export const test = {
  [namespace]: () => {
    return {
      enabled: true,
      port:
        15000 +
        (process.env.JEST_WORKER_ID ? parseInt(process.env.JEST_WORKER_ID) : 0),
      secure: false,
      maxDataLength: 999,
    };
  },
};
