import dateFormat from "dateformat";

type STRING_ENCODINGS = "ascii" | "utf-8" | "utf-16le" | "utf-16be";
const BIG_INT_256 = BigInt(256);
const BIG_INT_2 = BigInt(2);
const BIG_INT_MINUS_1 = BigInt(-1);

const MAX_VALUES = {
    1: BIG_INT_256 ** BigInt(1),
    2: BIG_INT_256 ** BigInt(2),
    4: BIG_INT_256 ** BigInt(4),
    8: BIG_INT_256 ** BigInt(8),
};

export type AllowedLengths = 1 | 2 | 4 | 8

export const convertToInteger = (data: Uint8Array, lengthInBytes: AllowedLengths, isSigned: boolean, isBigEndian: boolean): string => {
    if (lengthInBytes > data.length) return "";

    let arr = data.slice(0, lengthInBytes);

    if (!isBigEndian)
        arr = arr.reverse();

    let num = BigInt(0);
    for (let i = 0; i < arr.length; i++)
        num = num * BIG_INT_256 + BigInt(arr[i]);

    if (isSigned) {
        const maxVal = MAX_VALUES[lengthInBytes];
        if (num >= (maxVal / BIG_INT_2))
            num = (maxVal - num) * BIG_INT_MINUS_1;
    }

    return num.toString();
};

export const convertToFloat = (data: Uint8Array): string => {
    return data.length >= 4
        ? "" + new Float32Array(data.buffer.slice(0, 4))[0]
        : "";
};


export const convertToDouble = (data: Uint8Array): string => {
    return data.length >= 8
        ? "" + new Float64Array(data.buffer.slice(0, 8))[0]
        : "";
};

export const convertToTimestamp = (data: Uint8Array): string => {
    const u32le = convertToInteger(data, 4, false, false);
    const date = new Date(parseInt(u32le) * 1000);
    return u32le
        ? dateFormat(date, "yyyy-mm-dd HH:MM:ss")
        : "";
};

export const convertToString = (data: Uint8Array, encoding: STRING_ENCODINGS): string => {
    const decodedString = new TextDecoder(encoding).decode(data);
    for (let i = 0; i < decodedString.length; i++)
        if (decodedString[i] === "\0")
            return decodedString.substring(0, i);
    return decodedString + "...";
};

