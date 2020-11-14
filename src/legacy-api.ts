import { createServer, IncomingMessage, ServerResponse } from "http";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { decodeWsMessage } from "./decoder";
import { shakeHand } from "./server";
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
