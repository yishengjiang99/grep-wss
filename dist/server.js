"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
var http_1 = require("http");
var crypto_1 = require("crypto");
var encoder_1 = require("./encoder");
var decoder_1 = require("./decoder");
function WebSocketServer(props) {
    var onConnection = props.onConnection, onHttp = props.onHttp, onData = props.onData, onListening = props.onListening, port = props.port;
    var httpd = http_1.createServer(function (req, res) {
        onHttp ? onHttp(req, res) : res.end(200);
    });
    httpd.on("upgrade", function (req, socket) {
        var session = {};
        var reply = function (msg) {
            encoder_1.write(socket, msg);
        };
        shakeHand(socket, req.headers["sec-websocket-key"].trim());
        onConnection && onConnection(reply, session, socket);
        onData && socket.on("data", function (d) {
            onData(decoder_1.decodeWsMessage(d), function (msg) {
                encoder_1.write(socket, msg);
            }, session, socket);
        });
    });
    httpd.on("error", console.error);
    onListening && httpd.on("listening", onListening);
    httpd.listen(port);
    return httpd;
}
exports.WebSocketServer = WebSocketServer;
;
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
