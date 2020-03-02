export declare const DEFAULT: {
    servers: {
        socket: (config: any) => {
            enabled: boolean;
            secure: boolean;
            serverOptions: {};
            port: number;
            bindIP: string;
            setKeepAlive: boolean;
            delimiter: string;
            maxDataLength: number;
        };
    };
};
export declare const test: {
    servers: {
        socket: (config: any) => {
            enabled: boolean;
            port: number;
            secure: boolean;
            maxDataLength: number;
        };
    };
};
