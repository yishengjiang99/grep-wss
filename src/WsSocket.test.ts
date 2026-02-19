import { wscat } from "./wsclient";
import { unlinkSync } from "fs";
import { WsSocket } from "./WsSocket";
import { Socket, createConnection } from "net";
import { createServer, IncomingMessage } from "http";
import { execSync } from "child_process";
import { shakeHand } from "./server";
import { WsServer } from "./index";
//@ts-ignore
import { expect } from "../chai.min.js";

//@ts-ignore
import { describe, afterEach, it, done as donefn } from "../mocha.min.js";
describe("WsSocket", () => {
  let server: WsServer | undefined;
  afterEach(() => {
    if (server) server.stop();
  });
  it("contains these attributes", (donefn: () => void) => {
    // tmp = "sock-" + process.hrtime()[1];
    // // unlinkSync(tmp);
    const server = createServer();
    const host = "localhost";
    const port = 3009;

    server.on("connection", (socket: Socket) => {
      socket.on("data", (d) => {
        console.log(d.toString());
      });
    });

    server.on(
      "upgrade",
      (req: IncomingMessage, socket: Socket, head: Buffer) => {
        const ws = new WsSocket(socket, req);

        shakeHand(socket, req.headers);

        expect(ws.headers).exist;
        socket.prependListener("data", (d) => {
          console.log("original ", d.toString());
        });
        ws.on("data", (d) => {
          console.log("decoded", d.toString());
          socket.end();
          server.close();

          donefn();
        });
      }
    );
    server.on("listening", () => {
      wscat(host, port).then((wsc) => {
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

