"use strict";
// // export {};
// // import { header, generator } from "./encoder";
// // import test from "tape";
// // import { createWriteStream, closeSync } from "fs";
// // test("headerFrame", function (t) {
// //   t.deepEqual(header(1, false, true, true), Buffer.from([0x81, 0x01]));
// //   t.deepEqual(header(1, true, true, true), Buffer.from([0x82, 0x01]));
// //   t.deepEqual(header(1, true, false, true), Buffer.from([0x80, 0x01]));
// //   t.deepEqual(header(1, true, false, false), Buffer.from([0x00, 0x01]));
// //   t.deepEqual(
// //     header(0xff, true, true, true),
// //     Buffer.from([0x82, 0x7e, 0x00, 0xff])
// //   );
// //   t.deepEqual(header(0x7e, true, true, true), Buffer.from([0x82, 0x7e]));
// //   t.deepEqual(
// //     header(0x7f, true, true, true),
// //     Buffer.from([0x82, 0x7e, 0x00, 0x7f])
// //   );
// //   t.end();
// // });
// import { header } from "./encoder";
// import { expect } from "chai";
// // test("generator", function (t) {
// //   t.plan(6);
// //   const buff = Buffer.alloc(0xff);
// //   buff.fill(0);
// //   const gen = generator(Buffer.alloc(0xff), true);
// //   let { done, value } = gen.next();
// //   const [header, body] = value!;
// //   t.deepEqual(header[0], 0x82);
// //   t.deepEqual(header[1], 0x7e);
// //   t.deepEqual(body[1], 0x00);
// //   t.equal(done, false);
// //   t.equal(gen.next().done, true);
// //   t.equal(gen.next().value, undefined);
// // });
// describe("encoder", () => {
//   it("encodes head and body", () => {
//     expect(header(1, false, true, true)).to.deep.eq(Buffer.from([0x81, 0x01]));
//   });
// });
