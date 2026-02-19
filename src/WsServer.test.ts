//@ts-ignore
import { expect } from "../chai.min.js";
import { cspawn, wscat, WsSocket } from "./index";
import { WsServer } from "./index";
//@ts-ignore
import { describe, afterEach, it, done } from "../mocha.min.js";
describe("wsserver", () => {
  let server: WsServer;
  afterEach(() => {
    server.stop();
  });
  it("can run as standalone server", (done: () => void) => {
    server = new WsServer({
      port: 3422,
    });
    server.on("connection", (ws: WsSocket) => {
      expect(ws.webSocketKey.length).gt(5); //.exist;
      //ws.write("hello");
      ws.on("data", (d) => {
        ws.write(d.toString());
      });
    });
    server.start();
    server.on("listening", (port) => {
      expect(port).eq(3422);
      wscat("localhost", 3422).then((wsc) => {
        {
          wsc.stdout.on("data", (d) => {
            expect(d).to.exist;
            done();
          });
          wsc.stdin.write("hello");
        }
      });
    });
  }).timeout(10000);

  it.skip("try wscat", (done: () => void) => {
    server = new WsServer({
      port: 3423,
    });

    server.on("connection", (ws: WsSocket) => {
      expect(ws.webSocketKey.length).gt(5); //.exist;
      ws.on("data", (d) => {
        expect(true);
        ws.write(d.toString());
        done();
      });
    });
    server.on("listening", () => {
      const { stdin, stdout, stderr } = cspawn(
        "node ./node_modules/.bin/wscat -c ws://localhost:3423"
      );
      console.log("connected");
      stdout.on("data", (d: Buffer) => {
        if (!d.toString().startsWith(">")) {
          expect(d.toString().trim()).to.equal("hello");
          done();
        }
      });
      stderr.on("data", (d: Buffer) => {
        console.log(d.toString());
        expect(d.toString()).to.not.exist;
        done();
      });

      // stdin.setRawMode(true);
      // stdin.write(">welcome\r\n\r\n");
      // setTimeout(expect.fail, 11100);
    });
    server.start();
  }).timeout(101000);
});
