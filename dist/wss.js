"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wscat = exports.testformat = exports.WebSocketServer = void 0;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
var http_1 = require("http");
var crypto_1 = require("crypto");
var types_1 = require("./types");
function WebSocketServer(props) {
    var onConnection = props.onConnection, onHttp = props.onHttp, onData = props.onData, onListening = props.onListening, port = props.port;
    var httpd = http_1.createServer(function (req, res) {
        onHttp ? onHttp(req, res) : res.end(200);
    });
    httpd
        .on("connection", function () { })
        .on("upgrade", function (req, socket) {
        var key = req.headers["sec-websocket-key"].trim();
        var digest = crypto_1.createHash("sha1")
            .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
            .digest("base64");
        socket.write("HTTP/1.1 101 Switching Protocols \r\n");
        socket.write("Upgrade: websocket \r\n");
        socket.write("Connection: Upgrade \r\n");
        socket.write("Sec-WebSocket-Accept: " + digest + " \r\n");
        socket.write("\r\n");
        var wssocket = {
            socket: socket,
            send: function (msg) { return writeFrame(socket, msg); },
            write: function (msg) { return writeFrame(socket, msg); },
            context: new Map(),
        };
        onConnection && onConnection(wssocket);
        socket.on("data", function (d) { return onData(wssocket, decodeWsMessage(d)); });
    })
        .on("error", function (e) {
        console.error(e);
    })
        .listen(port);
    httpd.on("listening", function () {
        onListening && onListening("listening on " + port);
    });
    return httpd;
}
exports.WebSocketServer = WebSocketServer;
function testformat() {
    //	wsReply(Buffer.from("12345")); //, { fin: false, binary: true, mask: true });
}
exports.testformat = testformat;
function wscat(port) {
    if (port === void 0) { port = 3000; }
    var nc = types_1.cspawn("nc", "localhost " + port);
    nc.stdin.on("pipe", function () {
        nc.stdin.write("GET ws://localhost:" + port + "/ HTTP/1.1\r\n" +
            ("Host: localhost:" + port + "\r\n") +
            "Connection: Upgrade\r\n" +
            "Upgrade: websocket\r\n" +
            "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
            "Sec-WebSocket-Extensions: what she said\r\n\r\n");
    });
    var hexdump = types_1.cspawn("hexdump", "");
    nc.stdout.pipe(process.stdout);
    nc.stdout.on("error", function (d) {
        process.stdout.write(d.toString());
    });
    process.stdin.pipe(nc.stdin);
}
exports.wscat = wscat;
