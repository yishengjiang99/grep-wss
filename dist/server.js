"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.handleWsRequest = (httpd, getHandler) => {
    httpd.on("upgrade", (req, socket) => {
        exports.shakeHand(socket, req.headers["sec-websocket-key"].toString().trim());
        getHandler(req.url || "")(new WsSocket_1.WsSocket(socket, req));
    });
};
class WsServer extends events_1.EventEmitter {
    constructor(props) {
        super();
        this.start = () => {
            this.server.on("upgrade", (req, socket) => {
                this.connected.push(socket);
                exports.shakeHand(socket, req.headers["sec-websocket-key"].trim());
                const wsSocket = new WsSocket_1.WsSocket(socket);
                this.emit("connection", wsSocket, req);
                socket.on("data", (d) => {
                    this.emit("data", decoder_1.decodeWsMessage(d), wsSocket);
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
            this.server = http_1.createServer((req, res) => {
                this.emit("http", [req, res]);
            });
        }
        this.connected = [];
    }
}
exports.WsServer = WsServer;
exports.shakeHand = (socket, key) => {
    const digest = crypto_1.createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols \r\n");
    socket.write("Upgrade: websocket \r\n");
    socket.write("Connection: Upgrade \r\n");
    socket.write(`Sec-WebSocket-Accept: ${digest} \r\n`);
    socket.write("\r\n");
};
__exportStar(require("./legacy-api"), exports);
