export const decodeWsMessage = (msg: Buffer): Buffer => {
  const masked = msg[1] & 0x80;
  let maskOffset = 2;

  if ((msg[1] & 0x7f) === 0x7e) maskOffset = 4;        // 16-bit extended length: 2 + 2
  else if ((msg[1] & 0x7f) === 0x7f) maskOffset = 10;  // 64-bit extended length: 2 + 8
  const dataOffset = maskOffset + (masked ? 4 : 0);
  if (!masked) {
    return msg.subarray(dataOffset);
  }
  const mask = msg.subarray(maskOffset, maskOffset + 4);
  msg = msg.subarray(dataOffset);
  return Buffer.from(msg.map((v: number, i: number) => v ^ mask[i & 3]));
};
