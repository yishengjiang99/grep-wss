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

export type ConnectionHandler = (connection: WsSocket) => void;
export type RouteConnectionHandler = (uri: string) => ConnectionHandler;
