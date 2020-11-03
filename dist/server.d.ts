/// <reference types="node" />
import { IncomingMessage, ServerResponse, Server } from "http";
import { Socket } from "net";
declare type ReplyFunction = (msg: string | Buffer) => void;
export interface WebSocketServerProps {
    onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
    onData?: (data: Buffer, reply: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onConnection?: (reply: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onListening?: () => void;
    port: number;
}
export declare function WebSocketServer(props: WebSocketServerProps): Server;
export {};
