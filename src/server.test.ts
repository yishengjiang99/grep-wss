export {};
import { WebSocketServer } from './server';
import {IncomingMessage,ServerResponse} from 'http';

WebSocketServer({
    port: 3001,
    onHttp:(req:IncomingMessage, res:ServerResponse)=>{
        res.end("ok");
    },
    onListening:()=>{
        console.log("listening")
    }, 
    onConnection:(reply)=>{
        reply("HI");
    },
    onData:(data, reply)=>{
        reply(data);
    }
});
