/// <reference types="node" />
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
export declare type ConnectionHandler = (connection: WsSocket) => void;
export declare type RouteConnectionHandler = (uri: string) => ConnectionHandler;
export declare const handleWsRequest: (httpd: HttpServer | HttpsServer, getHandler: RouteConnectionHandler) => void;
export declare class WsServer extends EventEmitter {
    server: Server;
    port: any;
    connected: Socket[];
    constructor(props: {
        port?: any;
        server?: Server;
    });
    start: () => void;
    stop: () => void;
}
export declare const shakeHand: (socket: Socket, key: string) => void;
export * from "./legacy-api";
