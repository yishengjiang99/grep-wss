import {
  createServer,
  IncomingMessage,
  ServerResponse,
  RequestListener,
} from "http";
import { createHash } from "crypto";
import { Socket, Server } from "net";
import { WsSocket } from "./encoder";
import { decodeWsMessage } from "./decoder";
import { EventEmitter } from "events";
import { wscat } from "./wsclient";

export class WsServer extends EventEmitter {
  server: Server;
  port: any;
  constructor(props: { port?: any; server?: Server }) {
    super();
    this.port = props.port || 3000;
    if (props.server) this.server = props.server;
    else {
      this.server = createServer((req, res) => {
        this.emit("http", [req, res]);
      });
    }
  }
  start = () => {
    this.server.on("upgrade", (req: IncomingMessage, socket: Socket) => {
      shakeHand(socket, req.headers["sec-websocket-key"]!.trim());
      const wsSocket: WsSocket = new WsSocket(socket);
      this.emit("connection", [wsSocket, req]);
      socket.on("data", (d) => {
        this.emit("data", [decodeWsMessage(d), wsSocket]);
      });
      socket.on("close", () => {
        wsSocket.write = (str) => false;
      });
    });
    this.server.on("listening", () => this.emit("listening", [this.port]));
    this.server.listen(this.port);
  };
}

type ReplyFunction = (msg: string | Buffer) => void;
export interface WebSocketServerProps {
  onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
  onData?: (
    data: Buffer,
    reply: ReplyFunction,
    session?: Record<string, any>,
    socket?: Socket
  ) => void;
  onConnection?: (
    reply?: ReplyFunction,
    session?: Record<string, any>,
    socket?: Socket
  ) => void;
  onListening?: () => void;
  port: number;
}
export function WebSocketServer(props: WebSocketServerProps): Server {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end(200);
  });

  httpd.on("upgrade", (req: IncomingMessage, socket: Socket) => {
    const wsSocket: WsSocket = new WsSocket(socket);

    const session = {};
    const writeReply: ReplyFunction = (msg: Buffer | string) => {
      wsSocket.write(msg);
    };
    shakeHand(socket, req.headers["sec-websocket-key"]!.trim());
    onConnection && onConnection(writeReply, session, socket);
    onData &&
      socket.on("data", (d) => {
        onData(
          decodeWsMessage(d),
          (msg) => {
            writeReply(msg);
          },
          session,
          socket
        );
      });
  });
  httpd.on("error", console.error);
  onListening && httpd.on("listening", onListening);
  httpd.listen(port);
  return httpd;
}

const shakeHand = (socket: Socket, key: string) => {
  const digest = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols \r\n");
  socket.write("Upgrade: websocket \r\n");
  socket.write("Connection: Upgrade \r\n");
  socket.write(`Sec-WebSocket-Accept: ${digest} \r\n`);
  socket.write("\r\n");
};
