"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.header = header;
exports.generator = generator;
const FRAME_LENGTH = 1024 * 16;
function header(length, isBinary, isFirst, isLast, isMasked = false) {
    const optCode = isBinary ? 0x02 : 0x01;
    const b0 = (isFirst ? optCode : 0) + (isLast ? 0x80 : 0);
    if (length <= 0x7e) {
        return Buffer.from([b0, length & 0x7f]);
    }
    else if (length <= 0xffff) {
        const b = Buffer.alloc(4);
        b[0] = b0;
        b[1] = 0x7e;
        b.writeInt16BE(length, 2);
        return b;
    }
    else {
        const b = Buffer.alloc(10);
        b[0] = b0;
        b[1] = 0x7f;
        b.writeInt32BE((length & 0xffff0000) >> 8, 2);
        b.writeInt32BE(length & 0x0000ffff, 6);
        return b;
    }
}
function* generator(buff, isBinary) {
    let isFirst = true;
    while (buff.byteLength > FRAME_LENGTH) {
        yield [
            header(FRAME_LENGTH, isBinary, isFirst, false, false),
            buff.slice(0, FRAME_LENGTH),
        ];
        isFirst = false;
        buff = buff.slice(FRAME_LENGTH);
    }
    yield [header(buff.byteLength, isBinary, isFirst, true), buff];
}
