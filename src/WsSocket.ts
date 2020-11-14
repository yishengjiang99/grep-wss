import { Socket } from "net";
import { Writable, PassThrough, Transform } from "stream";
import { EventEmitter } from "events";
import { decodeWsMessage } from "./decoder";
import { IncomingMessage } from "http";
import { generator } from "./encoder";
export class WsSocket extends EventEmitter {
  headers: {};
  socket: Socket;
  closed: boolean = false;
  trailers: {};
  constructor(socket: Socket, request?: IncomingMessage) {
    super();
    this.socket = socket;
    this.headers = request?.rawHeaders || {};
    this.trailers = request?.rawTrailers || {};
    this.socket.on("data", (d) => {
      this.emit("data", decodeWsMessage(d));
    });
    this.socket.on("close", () => {
      this.closed = true;
      this.emit("close", []);
    });
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