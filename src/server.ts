import {
  createServer,
  IncomingHttpHeaders,
  IncomingMessage,
} from "http";
import { createHash } from "crypto";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";

export type ConnectionHandler = (connection: WsSocket, request?: IncomingMessage) => void;
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
  port: number;
  connected: Socket[];
  constructor(props: { port?: number; server?: Server }) {
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
      this.connected.push(socket);
      this.emit("connection", wsSocket, req);
      wsSocket.on("data", (d) => {
        this.emit("data", d, wsSocket);
      });
      wsSocket.on("close", () => {
        this.emit("close", socket);
        const idx = this.connected.indexOf(socket);
        if (idx !== -1) {
          this.connected.splice(idx, 1);
        }
      });
    });
    this.server.once("listening", () => this.emit("listening", this.port));
    this.server.listen(this.port);
  };
  stop = () => {
    this.connected.forEach((_s) => _s.destroy());
    this.server.close();
  };
}

export const shakeHand = (socket: Socket, headers: IncomingHttpHeaders) => {
  if (!headers["sec-websocket-key"]) return;

  const key = headers["sec-websocket-key"].toString().trim();
  const proto = headers["sec-websocket-protocol"]
    ? headers["sec-websocket-protocol"].toString().trim()
    : "";
  const digest = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols\r\n");
  socket.write("Upgrade: websocket\r\n");
  socket.write("Connection: Upgrade\r\n");
  socket.write(`Sec-WebSocket-Accept: ${digest}\r\n`);
  if (proto)
    socket.write(`Sec-WebSocket-Protocol: ${proto.trim().split(/ *, */)[0]}\r\n`);
  socket.write(
    `Sec-WebSocket-Extensions: permessage-deflate; server_max_window_bits=10 \r\n`
  );
  socket.write("\r\n");
};
