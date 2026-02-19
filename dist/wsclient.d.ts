export declare function wscat(host?: string, port?: number): Promise<{
    stdout: import("node:stream").Readable;
    stdin: import("node:stream").Writable;
    stderr: import("node:stream").Readable;
}>;
