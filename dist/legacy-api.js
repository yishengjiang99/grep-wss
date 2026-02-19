"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = WebSocketServer;
const http_1 = require("http");
const WsSocket_1 = require("./WsSocket");
const decoder_1 = require("./decoder");
const server_1 = require("./server");
///reference(path='./typings.d.ts';
function WebSocketServer(props) {
    const { onConnection, onHttp, onData, onListening, port } = props;
    const httpd = (0, http_1.createServer)((req, res) => {
        onHttp ? onHttp(req, res) : res.end(200);
    });
    httpd.on("upgrade", (req, socket, head) => {
        const wsSocket = new WsSocket_1.WsSocket(socket, req);
        const session = {};
        const writeReply = (msg) => {
            wsSocket.write(msg);
        };
        (0, server_1.shakeHand)(socket, req.headers);
        onConnection && onConnection(writeReply, session, socket);
        onData &&
            socket.on("data", (d) => {
                onData((0, decoder_1.decodeWsMessage)(d), (msg) => {
                    writeReply(msg);
                }, session, socket);
            });
    });
    httpd.on("error", console.error);
    onListening && httpd.on("listening", onListening);
    httpd.listen(port);
    return httpd;
}
