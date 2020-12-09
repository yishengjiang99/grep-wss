import { wscat } from "./wsclient";
import { unlinkSync } from "fs";
import { WsSocket } from "./WsSocket";
import { Socket, createConnection } from "net";
import { createServer, IncomingMessage } from "http";
import { execSync } from "child_process";
import { expect } from "chai";
import { shakeHand } from "./server";
describe("WsSocket", () => {
  let server;

  it("contains these attributes", (done) => {
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

        shakeHand(socket, "key");

        expect(ws.headers).exist;
        socket.prependListener("data", (d) => {
          console.log("original ", d.toString());
        });
        ws.on("data", (d) => {
          console.log("decoded", d.toString());
          socket.end();
          server.close();
          require("chai").expect.pass;
          done();
        });
      }
    );
    server.on("listening", () => {
      wscat(host, port).then((wsc) => {
        {
          wsc.stdin.write("ehllo");
        }
      });
    });
    server.listen(port, host);
  }).timeout(100232);
  after(() => {
    execSync("lsof -i tcp:3008|grep LISTEN| awk '{print $2}'|xargs kill -9");
  });
});
