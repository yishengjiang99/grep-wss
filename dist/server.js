"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shakeHand = exports.WsServer = exports.handleWsRequest = void 0;
const http_1 = require("http");
const crypto_1 = require("crypto");
const WsSocket_1 = require("./WsSocket");
const decoder_1 = require("./decoder");
const events_1 = require("events");
const handleWsRequest = (httpd, getHandler) => {
    httpd.on("upgrade", (req, socket) => {
        (0, exports.shakeHand)(socket, req.headers);
        getHandler(req.url || "")(new WsSocket_1.WsSocket(socket, req), req);
    });
};
exports.handleWsRequest = handleWsRequest;
class WsServer extends events_1.EventEmitter {
    constructor(props) {
        super();
        this.start = () => {
            this.server.on("upgrade", (req, socket) => {
                (0, exports.shakeHand)(socket, req.headers);
                const wsSocket = new WsSocket_1.WsSocket(socket, req);
                this.emit("connection", wsSocket, req);
                socket.on("data", (d) => {
                    this.emit("data", (0, decoder_1.decodeWsMessage)(d), wsSocket);
                });
                socket.on("close", () => {
                    this.emit("close", socket);
                    this.connected.forEach((_s, idx) => {
                        if (_s === socket) {
                            this.connected.splice(idx, 1);
                        }
                    });
                });
            });
            this.server.once("listening", () => this.emit("listening", this.port));
            this.server.listen(this.port);
        };
        this.stop = () => {
            this.connected.forEach((_s) => _s.destroy());
            this.server.close(() => {
                console.log("closed");
            });
        };
        this.port = props.port || 3000;
        if (props.server)
            this.server = props.server;
        else {
            this.server = (0, http_1.createServer)((req, res) => {
                this.emit("http", [req, res]);
            });
        }
        this.connected = [];
    }
}
exports.WsServer = WsServer;
const shakeHand = (socket, headers) => {
    //if (!headers["Sec-WebSocket-Key"]) return;
    const key = headers["sec-websocket-key"].toString().trim();
    const proto = headers["sec-websocket-protocol"]
        ? headers["sec-websocket-protocol"].toString().trim()
        : "";
    const digest = (0, crypto_1.createHash)("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");
    const socketwrite = (str) => {
        // console.log(str);
        socket.write(str);
    };
    socketwrite("HTTP/1.1 101 Switching Protocols\r\n");
    socketwrite("Upgrade: websocket\r\n");
    socketwrite("Connection: Upgrade\r\n");
    socketwrite(`Sec-WebSocket-Accept: ${digest}\r\n`);
    if (proto)
        socketwrite(`Sec-WebSocket-Protocol: ${proto.trim().split(/ *, */)}\r\n`);
    socketwrite(`Sec-WebSocket-Extensions: permessage-deflate; server_max_window_bits=10 \r\n`);
    socketwrite("\r\n");
};
exports.shakeHand = shakeHand;
__exportStar(require("./legacy-api"), exports);
