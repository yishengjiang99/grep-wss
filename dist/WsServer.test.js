"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const chai_min_js_1 = require("../chai.min.js");
const _1 = require(".");
const _2 = require("./");
//@ts-ignore
const mocha_min_js_1 = require("../mocha.min.js");
(0, mocha_min_js_1.describe)("wsserver", () => {
    let server;
    (0, mocha_min_js_1.afterEach)(() => {
        server.stop();
    });
    (0, mocha_min_js_1.it)("can run as standalone server", (done) => {
        server = new _2.WsServer({
            port: 3422,
        });
        server.on("connection", (ws) => {
            (0, chai_min_js_1.expect)(ws.webSocketKey.length).gt(5); //.exist;
            //ws.write("hello");
            ws.on("data", (d) => {
                ws.write(d.toString());
            });
        });
        server.start();
        server.on("listening", (port) => {
            (0, chai_min_js_1.expect)(port).eq(3422);
            (0, _1.wscat)("localhost", 3422).then((wsc) => {
                {
                    wsc.stdout.on("data", (d) => {
                        (0, chai_min_js_1.expect)(d).to.exist;
                        done();
                    });
                    wsc.stdin.write("hello");
                }
            });
        });
    }).timeout(10000);
    mocha_min_js_1.it.skip("try wscat", (done) => {
        server = new _2.WsServer({
            port: 3423,
        });
        server.on("connection", (ws) => {
            (0, chai_min_js_1.expect)(ws.webSocketKey.length).gt(5); //.exist;
            ws.on("data", (d) => {
                (0, chai_min_js_1.expect)(true);
                ws.write(d.toString());
                done();
            });
        });
        server.on("listening", () => {
            const { stdin, stdout, stderr } = (0, _1.cspawn)("node ./node_modules/.bin/wscat -c ws://localhost:3423");
            console.log("connected");
            stdout.on("data", (d) => {
                if (!d.toString().startsWith(">")) {
                    (0, chai_min_js_1.expect)(d.toString().trim()).to.equal("hello");
                    done();
                }
            });
            stderr.on("data", (d) => {
                console.log(d.toString());
                (0, chai_min_js_1.expect)(d.toString()).to.not.exist;
                done();
            });
            // stdin.setRawMode(true);
            // stdin.write(">welcome\r\n\r\n");
            // setTimeout(expect.fail, 11100);
        });
        server.start();
    }).timeout(101000);
});
