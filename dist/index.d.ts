import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { WsSocket } from "./WsSocket";
export * from "./server";
export * from "./encoder";
export { wscat } from "./wsclient";
export { WsSocket } from "./WsSocket";
export interface WebSocketServerProps {
    onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
    onData?: (data: Buffer, reply: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onConnection?: (reply?: ReplyFunction, session?: Record<string, any>, socket?: Socket) => void;
    onListening?: () => void;
    port: number;
}
export type ReplyFunction = (msg: string | Buffer) => void;
export type ConnectionHandler = (connection: WsSocket) => void;
export type RouteConnectionHandler = (uri: string) => ConnectionHandler;
export declare const cspawn: (str: string) => any;
