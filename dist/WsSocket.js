"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsSocket = void 0;
const events_1 = require("events");
const decoder_1 = require("./decoder");
const encoder_1 = require("./encoder");
class WsSocket extends events_1.EventEmitter {
    constructor(socket, request) {
        super();
        this.closed = false;
        this.socket = socket;
        this.headers = request.headers;
        if (!request.headers["sec-websocket-key"])
            throw "no sec key";
        this.webSocketKey = request.headers["sec-websocket-key"];
        this.socket.on("data", (d) => {
            console.log(d.toString());
            this.emit("data", (0, decoder_1.decodeWsMessage)(d));
        });
        this.socket.on("close", () => {
            this.closed = true;
            this.emit("close", []);
        });
    }
    send(str) {
        return this.write(str);
    }
    write(str) {
        if (this.closed)
            return false;
        const nextGen = typeof str === "string"
            ? (0, encoder_1.generator)(Buffer.from(str), false)
            : (0, encoder_1.generator)(Buffer.from(str), true);
        let ret = true;
        while (true) {
            const result = nextGen.next();
            if (result.done || !result.value)
                break;
            const [header, body] = result.value;
            if (!this.socket)
                continue;
            ret = ret && this.socket.write(Buffer.concat([header, body]));
        }
        return ret;
    }
}
exports.WsSocket = WsSocket;
