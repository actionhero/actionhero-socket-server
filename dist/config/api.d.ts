export declare const DEFAULT: {
    general: (config: any) => {
        apiVersion: any;
        serverName: any;
        serverToken: string;
        cachePrefix: string;
        lockPrefix: string;
        lockDuration: number;
        simultaneousActions: number;
        enforceConnectionProperties: boolean;
        disableParamScrubbing: boolean;
        filteredParams: any[];
        missingParamChecks: string[];
        directoryFileType: string;
        fileRequestLogLevel: string;
        defaultMiddlewarePriority: number;
        channel: string;
        rpcTimeout: number;
        cliIncludeInternal: boolean;
        paths: {
            action: any[];
            task: any[];
            server: any[];
            cli: any[];
            initializer: any[];
            public: any[];
            pid: any[];
            log: any[];
            plugin: any[];
            locale: any[];
            test: any[];
            src: any;
            dist: any;
        };
        startingChatRooms: {};
    };
};
export declare const test: {
    general: (config: any) => {
        serverToken: string;
        startingChatRooms: {
            defaultRoom: {};
            otherRoom: {};
        };
        paths: {
            locale: any[];
        };
        rpcTimeout: number;
    };
};
export declare const production: {
    general: (config: any) => {
        fileRequestLogLevel: string;
    };
};
