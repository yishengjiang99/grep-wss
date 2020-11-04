/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { Socket, Server } from "net";
import { EventEmitter } from "events";
export declare class WsServer extends EventEmitter {
    server: Server;
    port: any;
    constructor(props: {
        port?: any;
        server?: Server;
    });
    start: () => void;
}
declare type ReplyFunction = (msg: string | Buffer) => void;
export interface WebSocketServerProps {
    onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
    onData?: (data: Buffer, reply: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onConnection?: (reply?: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onListening?: () => void;
    port: number;
}
export declare function WebSocketServer(props: WebSocketServerProps): Server;
export {};
