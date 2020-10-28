import {spawn,ChildProcess} from 'child_process';
import {createInterface,Interface} from 'readline' ;
export function wscat(host:string = 'localhost', port:number = 3000):Interface{
    const nc = spawn("nc", [host, port+'']);
    nc.stdout.on("pipe", () => {
      nc.stdin.write(
        `GET ws://${host}:${port}/ HTTP/1.1\r\n` +
          `Host: ${host}:${port}\r\n` +
          "Connection: Upgrade\r\n" +
          "Upgrade: websocket\r\n" +
          "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
          "Sec-WebSocket-Extensions: what she said\r\n\r\n"
      );
    });
    const hexdump = spawn("hexdump");
    nc.stdout.pipe(hexdump.stdin);
    return createInterface(hexdump.stdout, nc.stdin);
  }
  