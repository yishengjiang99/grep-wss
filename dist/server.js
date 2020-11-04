"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = exports.WsServer = void 0;
var http_1 = require("http");
var crypto_1 = require("crypto");
var encoder_1 = require("./encoder");
var decoder_1 = require("./decoder");
var events_1 = require("events");
var WsServer = /** @class */ (function (_super) {
    __extends(WsServer, _super);
    function WsServer(props) {
        var _this = _super.call(this) || this;
        _this.start = function () {
            _this.server.on("upgrade", function (req, socket) {
                shakeHand(socket, req.headers["sec-websocket-key"].trim());
                var wsSocket = new encoder_1.WsSocket(socket);
                _this.emit("connection", [wsSocket, req]);
                socket.on("data", function (d) {
                    _this.emit("data", [decoder_1.decodeWsMessage(d), wsSocket]);
                });
                socket.on("close", function () {
                    wsSocket.write = function (str) { return false; };
                });
            });
            _this.server.on("listening", function () { return _this.emit("listening", [_this.port]); });
            _this.server.listen(_this.port);
        };
        _this.port = props.port || 3000;
        if (props.server)
            _this.server = props.server;
        else {
            _this.server = http_1.createServer(function (req, res) {
                _this.emit("http", [req, res]);
            });
        }
        return _this;
    }
    return WsServer;
}(events_1.EventEmitter));
exports.WsServer = WsServer;
function WebSocketServer(props) {
    var onConnection = props.onConnection, onHttp = props.onHttp, onData = props.onData, onListening = props.onListening, port = props.port;
    var httpd = http_1.createServer(function (req, res) {
        onHttp ? onHttp(req, res) : res.end(200);
    });
    httpd.on("upgrade", function (req, socket) {
        var wsSocket = new encoder_1.WsSocket(socket);
        var session = {};
        var writeReply = function (msg) {
            wsSocket.write(msg);
        };
        shakeHand(socket, req.headers["sec-websocket-key"].trim());
        onConnection && onConnection(writeReply, session, socket);
        onData &&
            socket.on("data", function (d) {
                onData(decoder_1.decodeWsMessage(d), function (msg) {
                    writeReply(msg);
                }, session, socket);
            });
    });
    httpd.on("error", console.error);
    onListening && httpd.on("listening", onListening);
    httpd.listen(port);
    return httpd;
}
exports.WebSocketServer = WebSocketServer;
var shakeHand = function (socket, key) {
    var digest = crypto_1.createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols \r\n");
    socket.write("Upgrade: websocket \r\n");
    socket.write("Connection: Upgrade \r\n");
    socket.write("Sec-WebSocket-Accept: " + digest + " \r\n");
    socket.write("\r\n");
};
