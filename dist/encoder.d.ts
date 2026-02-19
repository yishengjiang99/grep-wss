type Header = Buffer;
type Body = Buffer;
export declare function header(length: number, isBinary: boolean, isFirst: boolean, isLast: boolean, isMasked?: boolean): Buffer<ArrayBuffer>;
export declare function generator(buff: Buffer, isBinary: boolean): Generator<[Header, Body], void, boolean>;
export {};
