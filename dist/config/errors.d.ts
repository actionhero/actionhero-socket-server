export declare const DEFAULT: {
    errors: (config: any) => {
        _toExpand: boolean;
        serializers: {
            servers: {
                web: (error: any) => any;
                websocket: (error: any) => any;
                socket: (error: any) => any;
                specHelper: (error: any) => any;
            };
        };
        invalidParams: (data: any, validationErrors: any) => any;
        missingParams: (data: any, missingParams: any) => any;
        unknownAction: (data: any) => any;
        unsupportedServerType: (data: any) => any;
        serverShuttingDown: (data: any) => any;
        tooManyPendingActions: (data: any) => any;
        genericError(data: any, error: any): Promise<any>;
        fileNotFound: (connection: any) => any;
        fileNotProvided: (connection: any) => any;
        fileReadError: (connection: any, error: any) => any;
        verbNotFound: (connection: any, verb: any) => any;
        verbNotAllowed: (connection: any, verb: any) => any;
        connectionRoomAndMessage: (connection: any) => any;
        connectionNotInRoom: (connection: any, room: any) => any;
        connectionAlreadyInRoom: (connection: any, room: any) => any;
        connectionRoomHasBeenDeleted: (room: any) => string;
        connectionRoomNotExist: (room: any) => string;
        connectionRoomExists: (room: any) => string;
        connectionRoomRequired: (room: any) => string;
    };
};
