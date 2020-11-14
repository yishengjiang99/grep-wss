import { createServer, IncomingMessage, ServerResponse } from "http";
import { createHash } from "crypto";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { decodeWsMessage } from "./decoder";
import { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";

export type ConnectionHandler = (connection: WsSocket) => void;
export type RouteConnectionHandler = (uri: string) => ConnectionHandler;

export const handleWsRequest = (
  httpd: HttpServer | HttpsServer,
  getHandler: RouteConnectionHandler
) => {
  httpd.on("upgrade", (req: IncomingMessage, socket: Socket) => {
    shakeHand(socket, req.headers["sec-websocket-key"]!.toString().trim());
    getHandler(req.url || "")(new WsSocket(socket, req));
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
      this.connected.push(socket);
      shakeHand(socket, req.headers["sec-websocket-key"]!.trim());
      const wsSocket: WsSocket = new WsSocket(socket);
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

export const shakeHand = (socket: Socket, key: string) => {
  const digest = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols \r\n");
  socket.write("Upgrade: websocket \r\n");
  socket.write("Connection: Upgrade \r\n");
  socket.write(`Sec-WebSocket-Accept: ${digest} \r\n`);
  socket.write("\r\n");
};
export * from "./legacy-api";
