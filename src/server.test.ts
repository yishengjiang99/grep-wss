export {};
import { write, header, generator } from './encoder';
import test from 'tape';
import {Writable} from 'stream';
import { WebSocketServer } from './server';

test("ws server", (t)=>{
    WebSocketServer({
        onData:(socket,d)=> socket.write(d),
        port:3010
    });
});