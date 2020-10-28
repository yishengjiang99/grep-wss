export {};
import test from 'tape';
import {Writable} from 'stream';
import {Socket, createConnection} from 'net';
import { WebSocketServer } from './server';
import { wscat } from './wsclient';
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
