/// <reference types="node" />
import { Socket } from "net";
import { EventEmitter } from "events";
declare type Header = Buffer;
declare type Body = Buffer;
export declare class WsSocket extends EventEmitter {
    socket: Socket;
    constructor(socket: Socket);
    write(str: Uint8Array | string): boolean;
}
export declare function header(length: number, isBinary: boolean, isFirst: boolean, isLast: boolean, isMasked?: boolean): Buffer;
export declare function generator(buff: Buffer, isBinary: boolean): Generator<[Header, Body], void, boolean>;
export {};
