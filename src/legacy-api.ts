import { createServer, IncomingMessage, ServerResponse } from "http";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { shakeHand } from "./server";

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
export type ReplyFunction = (msg: string | Buffer) => void;
///reference(path='./typings.d.ts';
export function WebSocketServer(props: WebSocketServerProps): Server {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end();
  });

  httpd.on("upgrade", (req: IncomingMessage, socket: Socket, _head: Buffer) => {
    shakeHand(socket, req.headers);
    const wsSocket: WsSocket = new WsSocket(socket, req);

    const session = {};
    const writeReply: ReplyFunction = (msg: Buffer | string) => {
      wsSocket.write(msg);
    };
    onConnection && onConnection(writeReply, session, socket);
    onData &&
      wsSocket.on("data", (d) => {
        onData(d, writeReply, session, socket);
      });
  });
  httpd.on("error", console.error);
  onListening && httpd.on("listening", onListening);
  httpd.listen(port);
  return httpd;
}
