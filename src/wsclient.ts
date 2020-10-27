import {spawn} from 'child_process';

export function wscat(host:string = 'localhost', port:number = 3000) {
    const nc = spawn("nc", [host, port+'']);
    nc.stdin.on("pipe", () => {
      nc.stdin.write(
        `GET ws://localhost:${port}/ HTTP/1.1\r\n` +
          `Host: localhost:${port}\r\n` +
          "Connection: Upgrade\r\n" +
          "Upgrade: websocket\r\n" +
          "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
          "Sec-WebSocket-Extensions: what she said\r\n\r\n"
      );
    });
    const hexdump = spawn("hexdump");
    nc.stdout.pipe(process.stdout);
    nc.stdout.on("error", (d) => {
      process.stdout.write(d.toString());
    });
  
    process.stdin.pipe(nc.stdin);
  }
  