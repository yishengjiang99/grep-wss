"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wscat = void 0;
var child_process_1 = require("child_process");
var readline_1 = require("readline");
function wscat(host, port) {
    if (host === void 0) { host = 'localhost'; }
    if (port === void 0) { port = 3000; }
    var nc = child_process_1.spawn("nc", [host, port + '']);
    nc.stdout.on("pipe", function () {
        nc.stdin.write("GET ws://" + host + ":" + port + "/ HTTP/1.1\r\n" +
            ("Host: " + host + ":" + port + "\r\n") +
            "Connection: Upgrade\r\n" +
            "Upgrade: websocket\r\n" +
            "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
            "Sec-WebSocket-Extensions: what she said\r\n\r\n");
    });
    var hexdump = child_process_1.spawn("hexdump");
    nc.stdout.pipe(hexdump.stdin);
    return readline_1.createInterface(hexdump.stdout, nc.stdin);
}
exports.wscat = wscat;
