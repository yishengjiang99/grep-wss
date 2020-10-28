"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeWsMessage = void 0;
exports.decodeWsMessage = function (msg) {
    var masked = msg[1] & 0x80;
    var binaryType = msg[0] & 0x02;
    var eom = msg[0] & 0x80;
    var maskOffset = 2;
    if ((msg[1] & 0x7f) < 0x7e)
        maskOffset = 2;
    else if ((msg[1] & 0x7f) == 0x7e)
        maskOffset = 4;
    else
        maskOffset = 12;
    var dataOffset = maskOffset + (masked ? 4 : 0);
    if (!masked) {
        msg.slice(dataOffset);
    }
    var mask = msg.slice(maskOffset, maskOffset + 4);
    msg = msg.slice(dataOffset);
    return msg.map(function (v, i) { return v ^ mask[i & 3]; });
};
