import {
  createServer,
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from "http";
import { createHash } from "crypto";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { decodeWsMessage } from "./decoder";
import { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";

export type ConnectionHandler = (connection: WsSocket, request?: any) => void;
export type RouteConnectionHandler = (uri: string) => ConnectionHandler;

export const handleWsRequest = (
  httpd: HttpServer | HttpsServer,
  getHandler: RouteConnectionHandler
) => {
  httpd.on("upgrade", (req: IncomingMessage, socket: Socket) => {
    shakeHand(socket, req.headers);
    getHandler(req.url || "")(new WsSocket(socket, req), req);
  });
};

export class WsServer extends EventEmitter {
  server: Server;
  port: any;
  connected: Socket[];
  constructor(props: { port?: any; server?: Server }) {
    super();
    this.port = props.port || 3000;
    if (props.server) this.server = props.server;
    else {
      this.server = createServer((req, res) => {
        this.emit("http", [req, res]);
      });
    }
    this.connected = [];
  }
  start = () => {
    this.server.on("upgrade", (req: IncomingMessage, socket: Socket) => {
      shakeHand(socket, req.headers);

      const wsSocket: WsSocket = new WsSocket(socket, req);
      this.emit("connection", wsSocket, req);
      socket.on("data", (d) => {
        this.emit("data", decodeWsMessage(d), wsSocket);
      });
      socket.on("close", () => {
        this.emit("close", socket);
        this.connected.forEach((_s, idx) => {
          if (_s === socket) {
            this.connected.splice(idx, 1);
          }
        });
      });
    });
    this.server.once("listening", () => this.emit("listening", this.port));
    this.server.listen(this.port);
  };
  stop = () => {
    this.connected.forEach((_s) => _s.destroy());
    this.server.close(() => {
      console.log("closed");
    });
  };
}

export const shakeHand = (socket: Socket, headers: IncomingHttpHeaders) => {
  //if (!headers["Sec-WebSocket-Key"]) return;

  const key = headers["sec-websocket-key"]!.toString().trim();
  const proto = headers["sec-websocket-protocol"]
    ? headers["sec-websocket-protocol"].toString().trim()
    : "";
  const digest = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  const socketwrite = (str: string) => {
    // console.log(str);
    socket.write(str);
  };
  socketwrite("HTTP/1.1 101 Switching Protocols\r\n");
  socketwrite("Upgrade: websocket\r\n");
  socketwrite("Connection: Upgrade\r\n");
  socketwrite(`Sec-WebSocket-Accept: ${digest}\r\n`);
  if (proto)
    socketwrite(`Sec-WebSocket-Protocol: ${proto.trim().split(/ *, */)}\r\n`);
  socketwrite(
    `Sec-WebSocket-Extensions: permessage-deflate; server_max_window_bits=10 \r\n`
  );

  socketwrite("\r\n");
};
export * from "./legacy-api";
