declare module "grep-wss"{
  import {Socket} from 'net';
  function WebSocketServer({
    port: number,
    onHttp: any,
    onConnection: any,
    onData: any
  }):void;
}


