"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wsclient_1 = require("./wsclient");
const WsSocket_1 = require("./WsSocket");
const http_1 = require("http");
const server_1 = require("./server");
//@ts-ignore
const chai_min_js_1 = require("../chai.min.js");
//@ts-ignore
const mocha_min_js_1 = require("../mocha.min.js");
(0, mocha_min_js_1.describe)("WsSocket", () => {
    let server;
    (0, mocha_min_js_1.afterEach)(() => {
        if (server)
            server.stop();
    });
    (0, mocha_min_js_1.it)("contains these attributes", (donefn) => {
        // tmp = "sock-" + process.hrtime()[1];
        // // unlinkSync(tmp);
        const server = (0, http_1.createServer)();
        const host = "localhost";
        const port = 3009;
        server.on("connection", (socket) => {
            socket.on("data", (d) => {
                console.log(d.toString());
            });
        });
        server.on("upgrade", (req, socket, head) => {
            const ws = new WsSocket_1.WsSocket(socket, req);
            (0, server_1.shakeHand)(socket, req.headers);
            (0, chai_min_js_1.expect)(ws.headers).exist;
            socket.prependListener("data", (d) => {
                console.log("original ", d.toString());
            });
            ws.on("data", (d) => {
                console.log("decoded", d.toString());
                socket.end();
                server.close();
                donefn();
            });
        });
        server.on("listening", () => {
            (0, wsclient_1.wscat)(host, port).then((wsc) => {
                {
                    wsc.stdin.write("ehllo");
                    wsc.stdin.end();
                }
            });
        });
        server.listen(port, host);
        // setTimeout(done, 2300);
    }).timeout(100232);
});
process.stdin.on("data", (d) => {
    if (d.toString().trim() === "?") {
        console.log(process.report && process.report.writeReport());
    }
});
