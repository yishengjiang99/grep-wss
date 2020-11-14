/// <reference types="node" />
export declare function wscat(host?: string, port?: number): Promise<{
    stdout: import("stream").Readable;
    stdin: import("stream").Writable;
    stderr: import("stream").Readable;
}>;
