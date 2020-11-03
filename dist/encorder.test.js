"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var encoder_1 = require("./encoder");
var tape_1 = __importDefault(require("tape"));
tape_1.default("headerFrame", function (t) {
    t.deepEqual(encoder_1.header(1, false, true, true), Buffer.from([0x81, 0x01]));
    t.deepEqual(encoder_1.header(1, true, true, true), Buffer.from([0x82, 0x01]));
    t.deepEqual(encoder_1.header(1, true, false, true), Buffer.from([0x80, 0x01]));
    t.deepEqual(encoder_1.header(1, true, false, false), Buffer.from([0x00, 0x01]));
    t.deepEqual(encoder_1.header(0xff, true, true, true), Buffer.from([0x82, 0x7e, 0x00, 0xff]));
    t.deepEqual(encoder_1.header(0x7e, true, true, true), Buffer.from([0x82, 0x7e]));
    t.deepEqual(encoder_1.header(0x7f, true, true, true), Buffer.from([0x82, 0x7e, 0x00, 0x7f]));
    t.end();
});
tape_1.default("generator", function (t) {
    t.plan(6);
    var buff = Buffer.alloc(0xff);
    buff.fill(0);
    var gen = encoder_1.generator(Buffer.alloc(0xff), true);
    var _a = gen.next(), done = _a.done, value = _a.value;
    var _b = __read(value, 2), header = _b[0], body = _b[1];
    t.deepEqual(header[0], 0x82);
    t.deepEqual(header[1], 0x7e);
    t.deepEqual(body[1], 0x00);
    t.equal(done, false);
    t.equal(gen.next().done, true);
    t.equal(gen.next().value, undefined);
});
