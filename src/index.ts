export * from "./server";
export * from "./legacy-api";
export * from "./encoder";
export { wscat } from "./wsclient";
export { WsSocket } from "./WsSocket";
export const cspawn = (str: string) => {
  const t = str.split(" ");
  return require("child_process").spawn(t.shift(), t);
};
