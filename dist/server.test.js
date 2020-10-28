"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
server_1.WebSocketServer({
    port: 3001,
    onHttp: function (req, res) {
        res.end("ok");
    },
    onListening: function () {
        console.log("listening");
    },
    onConnection: function (reply) {
        reply("HI");
    },
    onData: function (data, reply) {
        reply(data);
    }
});
