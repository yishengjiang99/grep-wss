type Header = Buffer;
type Body = Buffer;
const FRAME_LENGTH = 1024 * 16;
export function header(
  length: number,
  isBinary: boolean,
  isFirst: boolean,
  isLast: boolean,
  isMasked: boolean = false
) {
  const optCode = isBinary ? 0x02 : 0x01;
  const b0 = (isFirst ? optCode : 0) + (isLast ? 0x80 : 0);
  if (length <= 0x7e) {
    return Buffer.from([b0, length & 0x7f]);
  } else if (length <= 0xffff) {
    const b = Buffer.alloc(4);
    b[0] = b0;
    b[1] = 0x7e;
    b.writeInt16BE(length, 2);
    return b;
  } else {
    const b = Buffer.alloc(10);
    b[0] = b0;
    b[1] = 0x7f;
    b.writeUInt32BE(Math.floor(length / 0x100000000), 2);
    b.writeUInt32BE(length >>> 0, 6);
    return b;
  }
}

export function* generator(
  buff: Buffer,
  isBinary: boolean
): Generator<[Header, Body], void, boolean> {
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
