import { exception } from "console";
import { Writable,PassThrough } from "stream";

type Header = Buffer;
type Body = Buffer;
const FRAME_LENGTH =  1024*16;

export const write=(socket: Writable, data:Buffer|string):void=>{
  const nextGen = typeof data==='string' ?  generator(Buffer.from(data),false) : generator(data,true);
  while(true){
    const result = nextGen.next();
    console.log(result);
    if(result.done || !result.value) break;
    const  [header,body] = result.value;
    socket.write(Buffer.concat([header,body]))
  }
  socket.end();
}

export function header(length:number, isBinary:boolean, isFirst:boolean, isLast:boolean, isMasked:boolean=false){
  const optCode = isBinary ? 0x02 : 0x01;
  const b0 = ( isFirst ? optCode : 0) + (isLast ? 0x80 : 0);
  const b1 = isMasked ? 0x80 : 0 + length & 0x7f;
  if(length<=0x7E){
    return Buffer.from([b0, b1]);
  }else if(length <= 0xFFFF){
    const b = Buffer.alloc(4);
    b[0] = b0;
    b[1] = b1;
    b.writeInt16BE(length, 2);
    return b;
  }else {
    const b = Buffer.alloc(10);
    b[0] = b0;
    b[1] = b1;
    b.writeInt32BE((length & 0xffff0000) >> 8, 2);
    b.writeInt32BE(length & 0x0000ffff, 6);
    return b;  
  }
}

export function* generator(buff:Buffer, isBinary:boolean): Generator<[Header,Body], void, boolean> {
  let isFirst = true;
  while(buff.byteLength > FRAME_LENGTH){
    yield [
      header(FRAME_LENGTH,isBinary, isFirst, false, false),
      buff.slice(0,FRAME_LENGTH)
    ];
    isFirst = false;
    buff = buff.slice(FRAME_LENGTH);
  }

  yield [header(buff.byteLength, isBinary, isFirst, true), buff];
}
