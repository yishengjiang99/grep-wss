import { Socket } from "net";
import { Writable, PassThrough, Transform } from "stream";
import { EventEmitter } from "events";
import { decodeWsMessage } from "./decoder";
type Header = Buffer;
type Body = Buffer;
const FRAME_LENGTH = 1024 * 16;

export class WsSocket extends EventEmitter {
  socket: Socket;
  constructor(socket: Socket) {
    super();
    this.socket = socket;
  }
  write(str: Uint8Array | string): boolean {
    const nextGen =
      typeof str === "string"
        ? generator(Buffer.from(str), false)
        : generator(Buffer.from(str), true);
    let ret = true;
    while (true) {
      const result = nextGen.next();
      if (result.done || !result.value) break;
      const [header, body] = result.value;
      ret = ret && this.socket.write(Buffer.concat([header, body]));
    }
    return ret;
  }
}

export function header(
  length: number,
  isBinary: boolean,
  isFirst: boolean,
  isLast: boolean,
  isMasked: boolean = false
) {
  const optCode = isBinary ? 0x02 : 0x01;
  const b0 = (isFirst ? optCode : 0) + (isLast ? 0x80 : 0);
  if (length <= 0x7e) {
    return Buffer.from([b0, length & 0x7f]);
  } else if (length <= 0xffff) {
    const b = Buffer.alloc(4);
    b[0] = b0;
    b[1] = 0x7e;
    b.writeInt16BE(length, 2);
    return b;
  } else {
    const b = Buffer.alloc(10);
    b[0] = b0;
    b[1] = 0x7f;
    b.writeInt32BE((length & 0xffff0000) >> 8, 2);
    b.writeInt32BE(length & 0x0000ffff, 6);
    return b;
  }
}

export function* generator(
  buff: Buffer,
  isBinary: boolean
): Generator<[Header, Body], void, boolean> {
  let isFirst = true;
  while (buff.byteLength > FRAME_LENGTH) {
    yield [
      header(FRAME_LENGTH, isBinary, isFirst, false, false),
      buff.slice(0, FRAME_LENGTH),
    ];
    isFirst = false;
    buff = buff.slice(FRAME_LENGTH);
  }

  yield [header(buff.byteLength, isBinary, isFirst, true), buff];
}
