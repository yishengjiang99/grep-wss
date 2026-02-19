import { Socket } from "net";
import { EventEmitter } from "events";
import { IncomingMessage } from "http";
export declare class WsSocket extends EventEmitter {
    headers: {};
    socket: Socket;
    closed: boolean;
    webSocketKey: string;
    constructor(socket: Socket, request: IncomingMessage);
    send(str: any): boolean;
    write(str: Uint8Array | string): boolean;
}
