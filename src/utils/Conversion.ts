export class Conversion {
    static utf8BytesToStr(bytes: ArrayBufferLike) {
        return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    }

    static strToUtf8Bytes(str: string) {
        return new TextEncoder().encode(str).buffer;
    }
}