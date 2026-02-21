import { spawn } from "child_process";
export * from "./server";
export * from "./legacy-api";
export * from "./encoder";
export { wscat } from "./wsclient";
export { WsSocket } from "./WsSocket";
export const cspawn = (str: string) => {
  const t = str.split(" ");
  return spawn(t.shift()!, t);
};
