"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wscat = wscat;
const child_process_1 = require("child_process");
async function wscat(host = "localhost", port = 3000) {
    const { stdout, stdin, stderr } = (0, child_process_1.spawn)("nc", [host, port + ""]);
    const connected = new Promise((resolve) => {
        stdout.once("data", (d) => {
            resolve();
        });
    });
    stdin.write(`GET ws://${host}:${port}/ HTTP/1.1\r\n` +
        `Host: ${host}:${port}\r\n` +
        "Connection: Upgrade\r\n" +
        "Upgrade: websocket\r\n" +
        "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
        "Sec-WebSocket-Extensions: what she said\r\n\r\n");
    await connected;
    return { stdout, stdin, stderr };
}
// const ws = new WsServer({ port: 3333 });
// ws.on("connection", (sock) => {
//   sock.on("data", (msg: Buffer) => {
//     console.log("server got " + msg);
//     sock.write(msg.toString());
//   });
// });
// ws.on("listening", async () => {
//   const { stdout, stdin, stderr } = await wscat("localhost", 3333);
//   stdout.on("data", (d) => process.stdout.write(d.toString()));
//   process.stdin.pipe(stdin);
// });
// ws.start();
