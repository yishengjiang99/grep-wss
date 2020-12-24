import { expect } from "chai";
import { wscat, WsSocket } from ".";
import { WsServer } from "./";
import { decodeWsMessage } from "./decoder";
describe("wsserver", () => {
  it("can run as standalone server", (done) => {
    const server = new WsServer({
      port: 3422,
    });
    server.on("connection", (ws: WsSocket) => {
      expect(ws.webSocketKey.length).gt(5); //.exist;
      ws.on("data", (d) => {
        ws.write(Buffer.from(d));
        ws.write("additional message ");
        setTimeout(() => {
          server.stop();
        }, 21);
      });
    });
    server.start();
    server.on("listening", (port) => {
      expect(port).eq(3422);
      wscat("localhost", port).then((wsc) => {
        {
          wsc.stdin.write("ehllo");
          wsc.stdout.on("data", (d) => {
            console.log(decodeWsMessage(d).toString());
            // expect(decodeWsMessage(d).toString()).eq("ehllo");
          });
        }
      });
    });
    server.once("closed", () => {
      done();
    });
  });
});
