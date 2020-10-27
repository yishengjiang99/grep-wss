export type WsSocket = {
    write: (msg: string|Buffer) => void;
    socket: Socket;
  };

  export interface WebSocketServerProps {
    onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
    onConnection?: (socket: WsSocket) => void;
    onData?: (socket: WsSocket, data: Buffer) => void;
    port: number | string;
    onListening?: (msg: string) => void;
  }
  