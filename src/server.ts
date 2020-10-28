import { createServer,IncomingMessage,ServerResponse,Server} from "http";
import { createHash } from "crypto";
import { Socket } from "net";
import { write as writeReply} from './encoder';
import {decodeWsMessage} from './decoder';


type ReplyFunction = (msg: string|Buffer)=>void;
export interface WebSocketServerProps{
  onHttp?: (req: IncomingMessage, res:ServerResponse)=>void,
  onData?: (data:Buffer, reply:ReplyFunction )=>void,
  onConnection?: (reply:ReplyFunction)=>void,
  onListening?:()=>void,
  port: number,
}

export function WebSocketServer(props: WebSocketServerProps): Server {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end(200);
  });
  
  httpd.on("upgrade", (req:IncomingMessage, socket: Socket) => {
    const reply:ReplyFunction = (msg: Buffer|string)=>{
      writeReply(socket, msg);
    }
    shakeHand(socket,req.headers["sec-websocket-key"]!.trim());
    onConnection && onConnection(reply);
    onData && socket.on("data", (d)=>{
      onData(decodeWsMessage(d), (msg)=>{
        writeReply(socket,msg);
      });
    });
  });
  httpd.on("error",  console.error);
  onListening && httpd.on("listening", onListening);
  httpd.listen(port);
  return httpd;
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