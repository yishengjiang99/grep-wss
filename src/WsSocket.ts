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
  webSocketKey: string;
  constructor(socket: Socket, request: IncomingMessage) {
    super();
    this.socket = socket;
    this.headers = request.headers;
    if (!request.headers["sec-websocket-key"]) throw "no sec key";
    this.webSocketKey = request.headers["sec-websocket-key"] as string;
    this.socket.on("data", (d) => {
      console.log(d.toString());
      this.emit("data", decodeWsMessage(d));
    });
    this.socket.on("close", () => {
      this.closed = true;
      this.emit("close", []);
    });
  }
  send(str: any): boolean {
    return this.write(str);
  }
  write(str: Uint8Array | string): boolean {
    if (this.closed) return false;
    const nextGen =
      typeof str === "string"
        ? generator(Buffer.from(str), false)
        : generator(Buffer.from(str), true);
    let ret = true;
    while (true) {
      const result = nextGen.next();
      if (result.done || !result.value) break;
      const [header, body] = result.value;
      if (!this.socket) continue;
      ret = ret && this.socket.write(Buffer.concat([header, body]));
    }
    return ret;
  }
}
