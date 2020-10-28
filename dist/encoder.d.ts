/// <reference types="node" />
import { Writable } from "stream";
declare type Header = Buffer;
declare type Body = Buffer;
export declare const write: (socket: Writable, data: Buffer | string) => void;
export declare function header(length: number, isBinary: boolean, isFirst: boolean, isLast: boolean, isMasked?: boolean): Buffer;
export declare function generator(buff: Buffer, isBinary: boolean): Generator<[Header, Body], void, boolean>;
export {};
