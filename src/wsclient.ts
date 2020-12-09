import { spawn, ChildProcess } from "child_process";
import { createInterface, Interface } from "readline";

export async function wscat(host: string = "localhost", port: number = 3000) {
  const { stdout, stdin, stderr } = spawn("nc", [host, port + ""]);
  const connected = new Promise((resolve) => {
    stdout.on("data", (d) => {
      d.toString().substring("Sec-WebSocket-Accept:");
      console.log(d.toString());
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
