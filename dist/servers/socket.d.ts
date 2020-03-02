import { Server } from "actionhero";
export declare class SocketServer extends Server {
    constructor();
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    sendMessage(connection: any, message: any, messageId: any): Promise<void>;
    goodbye(connection: any): Promise<void>;
    sendFile(connection: any, error: any, fileStream: any): Promise<void>;
    handleConnection(rawConnection: any): void;
    onConnection(connection: any): Promise<void>;
    parseLine(connection: any, line: any): Promise<void>;
    parseRequest(connection: any, line: any): Promise<void>;
    checkBreakChars(chunk: any): boolean;
    gracefulShutdown(alreadyShutdown?: boolean): any;
}
