/// <reference types="node" />
import { IncomingMessage, ServerResponse, Server } from "http";
declare type ReplyFunction = (msg: string | Buffer) => void;
export interface WebSocketServerProps {
    onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
    onData?: (data: Buffer, reply: ReplyFunction) => void;
    onConnection?: (reply: ReplyFunction) => void;
    onListening?: () => void;
    port: number;
}
export declare function WebSocketServer(props: WebSocketServerProps): Server;
export {};
