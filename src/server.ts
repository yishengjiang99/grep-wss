import { createServer,IncomingMessage} from "http";
import { createHash } from "crypto";
import { Server, Socket } from "net";
import {WsSocket,WebSocketServerProps} from './index';
import {write as writeMessage} from './encoder';
import {decodeWsMessage} from './decoder';

export function WebSocketServer(props: WebSocketServerProps): void {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end(200);
  });
  httpd.on("upgrade", (req:IncomingMessage, socket: Socket) => {
    shakeHand(socket,req.headers["sec-websocket-key"]!.trim());
    const wsSocket:WsSocket = {
      socket,
      write: (msg:string|Buffer)=> writeMessage(socket, msg)
    };
    onConnection && onConnection(wsSocket);
    socket.on("data",d=>{
      onData!(wsSocket,decodeWsMessage(d))
    });
  });

  httpd.on("error",  console.error);
  httpd.listen(port);
  onListening && httpd.on("listening",onListening);
};

const shakeHand = (socket:Socket, key:string)=>{
  const digest = createHash("sha1")
  .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
  .digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols \r\n");
  socket.write("Upgrade: websocket \r\n");
  socket.write("Connection: Upgrade \r\n");
  socket.write(`Sec-WebSocket-Accept: ${digest} \r\n`);
  socket.write("\r\n")
}