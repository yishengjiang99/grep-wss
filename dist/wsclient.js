"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wscat = void 0;
const child_process_1 = require("child_process");
async function wscat(host = "localhost", port = 3000) {
  const { stdout, stdin, stderr } = child_process_1.spawn("nc", [
    host,
    port + "",
  ]);
  const connected = new Promise((resolve) => {
    stdout.on("data", (d) => {
      d.toString().substring("Sec-WebSocket-Accept:");
      resolve();
    });
  });
  stdin.write(
    `GET ws://${host}:${port}/ HTTP/1.1\r\n` +
      `Host: ${host}:${port}\r\n` +
      "Connection: Upgrade\r\n" +
      "Upgrade: websocket\r\n" +
      "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
      "Sec-WebSocket-Extensions: what she said\r\n\r\n"
  );
  await connected;
  return { stdout, stdin, stderr };
}
exports.wscat = wscat;
