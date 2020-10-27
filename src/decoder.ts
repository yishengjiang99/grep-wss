export const decodeWsMessage = (msg: Buffer): Buffer => {
    // we only support binary so we are ignoring some bits here
    // and only marginally care about length bits
    const masked = !(msg[1] & 0x80);
    const eom = !(msg[0] & 0x80);
    const maskOffset = msg[1] <= 0x7e ? 2 : (
                       msg[1] <= 0xffff ? 4 : 12);
    const dataOffset = maskOffset + (masked ? 4 : 0);
    if (!masked) {
      return msg.slice(dataOffset);
    }
    const mask = msg.slice(maskOffset, maskOffset + 4);
    msg = msg.slice(dataOffset);
    return new Proxy(msg, {
      get(obj, i: number) {
        return obj[i] ^ mask[i & 3];
      },
    });
  };