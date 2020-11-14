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
var http_1 = require("http");
var crypto_1 = require("crypto");
var WsSocket_1 = require("./WsSocket");
var decoder_1 = require("./decoder");
var events_1 = require("events");
exports.handleWsRequest = function (httpd, getHandler) {
    httpd.on("upgrade", function (req, socket) {
        exports.shakeHand(socket, req.headers["sec-websocket-key"].toString().trim());
        getHandler(req.url || "")(new WsSocket_1.WsSocket(socket, req));
    });
};
var WsServer = /** @class */ (function (_super) {
    __extends(WsServer, _super);
    function WsServer(props) {
        var _this = _super.call(this) || this;
        _this.start = function () {
            _this.server.on("upgrade", function (req, socket) {
                _this.connected.push(socket);
                exports.shakeHand(socket, req.headers["sec-websocket-key"].trim());
                var wsSocket = new WsSocket_1.WsSocket(socket);
                _this.emit("connection", wsSocket, req);
                socket.on("data", function (d) {
                    _this.emit("data", decoder_1.decodeWsMessage(d), wsSocket);
                });
                socket.on("close", function () {
                    _this.emit("close", socket);
                    _this.connected.forEach(function (_s, idx) {
                        if (_s === socket) {
                            _this.connected.splice(idx, 1);
                        }
                    });
                });
            });
            _this.server.once("listening", function () { return _this.emit("listening", _this.port); });
            _this.server.listen(_this.port);
        };
        _this.stop = function () {
            _this.connected.forEach(function (_s) { return _s.destroy(); });
            _this.server.close(function () {
                console.log("closed");
            });
        };
        _this.port = props.port || 3000;
        if (props.server)
            _this.server = props.server;
        else {
            _this.server = http_1.createServer(function (req, res) {
                _this.emit("http", [req, res]);
            });
        }
        _this.connected = [];
        return _this;
    }
    return WsServer;
}(events_1.EventEmitter));
exports.WsServer = WsServer;
exports.shakeHand = function (socket, key) {
    var digest = crypto_1.createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols \r\n");
    socket.write("Upgrade: websocket \r\n");
    socket.write("Connection: Upgrade \r\n");
    socket.write("Sec-WebSocket-Accept: " + digest + " \r\n");
    socket.write("\r\n");
};
__exportStar(require("./legacy-api"), exports);
