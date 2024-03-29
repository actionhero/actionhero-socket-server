import * as net from "net";
import * as tls from "tls";
import * as uuid from "uuid";
import { ActionProcessor, config, Connection, Server } from "actionhero";

type RawConnection = net.Socket | (net.Socket & { socketDataString: string });

export class SocketServer extends Server {
  constructor() {
    super();
    this.type = "socket";

    this.attributes = {
      canChat: true,
      logConnections: true,
      logExits: true,
      pendingShutdownWaitLimit: 5000,
      sendWelcomeMessage: true,
      verbs: [
        "quit",
        "exit",
        "documentation",
        "paramAdd",
        "paramDelete",
        "paramView",
        "paramsView",
        "paramsDelete",
        "roomAdd",
        "roomLeave",
        "roomView",
        "detailsView",
        "say",
      ],
    };
  }

  async initialize() {
    //
  }

  async start() {
    if (this.config.secure === false) {
      this.server = net.createServer(
        this.config.serverOptions,
        (rawConnection) => {
          this.handleConnection(rawConnection);
        },
      );
    } else {
      this.server = tls.createServer(
        this.config.serverOptions,
        (rawConnection) => {
          this.handleConnection(rawConnection);
        },
      );
    }

    this.server.on("error", (error: NodeJS.ErrnoException) => {
      throw new Error(
        `Cannot start socket server @ ${this.config.bindIP}:${this.config.port} => ${error.message}`,
      );
    });

    await new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.bindIP, resolve);
    });

    this.on("connection", async (connection: Connection) => {
      await this.onConnection(connection);
    });

    this.on("actionComplete", (data: ActionProcessor<any>) => {
      if (data.toRender === true) {
        data.response.context = "response";
        this.sendMessage(data.connection, data.response, data.messageId);
      }
    });
  }

  async stop() {
    await this.gracefulShutdown();
  }

  async sendMessage(
    connection: Connection,
    message: Record<string, any>,
    messageId: string | number,
  ) {
    if (message.error) {
      message.error = config.errors.serializers.servers
        ? await config.errors.serializers.servers.socket(message.error)
        : message.error.toString();
    }

    if (message.context === "response") {
      if (messageId) {
        message.messageId = messageId;
      } else {
        message.messageId = connection.messageId;
      }
    }

    try {
      connection.rawConnection.write(JSON.stringify(message) + "\r\n");
    } catch (e) {
      this.log(`socket write error: ${e}`, "error");
    }
  }

  // @ts-ignore
  async goodbye(connection: Connection) {
    try {
      connection.rawConnection.end(
        JSON.stringify({ status: "Bye", context: "api" }) + "\r\n",
      );
    } catch (e) {
      console.log(e);
    }
  }

  async sendFile(
    connection: Connection,
    error: NodeJS.ErrnoException,
    fileStream: any,
  ) {
    if (error) {
      this.sendMessage(connection, error, connection.messageId);
    } else {
      fileStream.pipe(connection.rawConnection, { end: false });
    }
  }

  handleConnection(rawConnection: RawConnection) {
    if (this.config.setKeepAlive === true) {
      rawConnection.setKeepAlive(true);
    }
    rawConnection["socketDataString"] = "";
    const id = uuid.v4();
    this.buildConnection({
      id,
      fingerprint: id,
      rawConnection: rawConnection,
      remoteAddress: rawConnection.remoteAddress,
      remotePort: rawConnection.remotePort,
    });
  }

  async onConnection(connection: Connection) {
    connection.params = {};

    connection.rawConnection.on("data", async (chunk) => {
      if (this.checkBreakChars(chunk)) {
        connection.destroy();
      } else {
        // Replace all carriage returns with newlines.
        connection.rawConnection.socketDataString += chunk
          .toString("utf-8")
          .replace(/\r/g, "\n");
        let index;
        const d = String(this.config.delimiter);

        while (
          (index = connection.rawConnection.socketDataString.indexOf(d)) > -1
        ) {
          const data = connection.rawConnection.socketDataString.slice(
            0,
            index,
          );
          connection.rawConnection.socketDataString =
            connection.rawConnection.socketDataString.slice(index + d.length);
          const lines = data.split(d);
          for (const i in lines) {
            await this.parseLine(connection, lines[i]);
          }
        }
      }
    });

    connection.rawConnection.on("end", () => {
      if (connection.destroyed !== true) {
        connection.destroy();
      }
    });

    connection.rawConnection.on("error", (e: NodeJS.ErrnoException) => {
      if (connection.destroyed !== true) {
        this.log("socket error: " + e, "error");
        try {
          connection.rawConnection.end();
        } catch (e) {}
        connection.destroy();
      }
    });
  }

  async parseLine(connection: Connection, line: string) {
    if (this.config.maxDataLength > 0) {
      const blen = Buffer.byteLength(line, "utf8");
      if (blen > this.config.maxDataLength) {
        const error = "DATA_LENGTH_TOO_LONG";
        this.log(error, "error");
        return this.sendMessage(
          connection,
          {
            status: "error",
            error: error,
            context: "response",
          },
          null,
        );
      }
    }

    if (line.length > 0) {
      this.parseRequest(connection, line);
    }
  }

  async parseRequest(connection: Connection, line: string) {
    const words = line.split(" ");
    const verb = words.shift();
    connection.messageId = connection.params.messageId || uuid.v4();

    if (verb === "file") {
      if (words.length > 0) {
        connection.params.file = words[0];
      }
      return this.processFile(connection);
    }

    if (this.attributes.verbs.indexOf(verb) >= 0) {
      try {
        const data = await connection.verbs(verb, words);
        return this.sendMessage(
          connection,
          { status: "OK", context: "response", data: data },
          connection.messageId,
        );
      } catch (error) {
        return this.sendMessage(
          connection,
          { error: error, context: "response" },
          connection.messageId,
        );
      }
    }

    try {
      const requestHash = JSON.parse(line);
      if (requestHash.params !== undefined) {
        connection.params = {};
        for (const v in requestHash.params) {
          connection.params[v] = requestHash.params[v];
        }
      }
      if (requestHash.action) {
        connection.params.action = requestHash.action;
      }
      if (connection.params.messageId) {
        connection.messageId = connection.params.messageId;
      }
    } catch (e) {
      connection.params.action = verb;
    }
    connection.error = null;
    connection.response = {};
    return this.processAction(connection);
  }

  checkBreakChars(chunk: Buffer) {
    let found = false;
    const hexChunk = chunk.toString("hex", 0, chunk.length);
    if (hexChunk === "fff4fffd06") {
      found = true; // CTRL + C
    } else if (hexChunk === "04") {
      found = true; // CTRL + D
    }

    return found;
  }

  async gracefulShutdown(alreadyShutdown = false) {
    if (!alreadyShutdown) {
      if (this.server) {
        this.server.close();
      }
    }

    let pendingConnections = 0;
    this.connections().forEach((connection) => {
      if (connection.pendingActions === 0) {
        connection.destroy();
      } else {
        pendingConnections++;
        if (!connection.rawConnection.shutDownTimer) {
          connection.rawConnection.shutDownTimer = setTimeout(
            connection.destroy,
            this.attributes.pendingShutdownWaitLimit,
          );
        }
      }
    });

    if (pendingConnections > 0) {
      this.log(
        `waiting on shutdown, there are still ${pendingConnections} connected clients waiting on a response`,
        "notice",
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      return this.gracefulShutdown(true);
    }
  }
}
