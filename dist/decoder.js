"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeWsMessage = void 0;
exports.decodeWsMessage = (msg) => {
    const masked = msg[1] & 0x80;
    const binaryType = msg[0] & 0x02;
    const eom = msg[0] & 0x80;
    let maskOffset = 2;
    if ((msg[1] & 0x7f) < 0x7e)
        maskOffset = 2;
    else if ((msg[1] & 0x7f) == 0x7e)
        maskOffset = 4;
    else
        maskOffset = 12;
    const dataOffset = maskOffset + (masked ? 4 : 0);
    if (!masked) {
        msg.slice(dataOffset);
    }
    const mask = msg.slice(maskOffset, maskOffset + 4);
    msg = msg.slice(dataOffset);
    return msg.map((v, i) => v ^ mask[i & 3]);
};
