import { createServer, IncomingMessage, ServerResponse } from "http";
import { Socket, Server } from "net";
import { WsSocket } from "./WsSocket";
import { decodeWsMessage } from "./decoder";
import { shakeHand } from "./server";
import { WebSocketServerProps, ReplyFunction } from "./index";
///reference(path='./typings.d.ts';
export function WebSocketServer(props: WebSocketServerProps): Server {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end(200);
  });

  httpd.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const wsSocket: WsSocket = new WsSocket(socket, req);

    const session = {};
    const writeReply: ReplyFunction = (msg: Buffer | string) => {
      wsSocket.write(msg);
    };
    shakeHand(socket, req.headers);
    onConnection && onConnection(writeReply, session, socket);
    onData &&
      socket.on("data", (d) => {
        onData(
          decodeWsMessage(d),
          (msg: string | Buffer) => {
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
