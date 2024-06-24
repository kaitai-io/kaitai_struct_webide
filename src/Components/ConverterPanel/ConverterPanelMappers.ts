import bigInt from "big-integer";
import dateFormat from "dateformat";

type STRING_ENCODINGS = "ascii" | "utf-8" | "utf-16le" | "utf-16be";

export const convertToInteger = (data: Uint8Array, lengthInBytes: number, isSigned: boolean, isBigEndian: boolean): string => {
    if (lengthInBytes > data.length) return "";

    let arr = data.slice(0, lengthInBytes);

    if (!isBigEndian)
        arr = arr.reverse();

    let num = bigInt(0);
    for (let i = 0; i < arr.length; i++)
        num = num.multiply(256).add(arr[i]);

    if (isSigned) {
        const maxVal = bigInt(256).pow(lengthInBytes);
        if (num.greaterOrEquals(maxVal.divide(2)))
            num = maxVal.minus(num).negate();
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
    var str = new TextDecoder(encoding).decode(data);
    for (var i = 0; i < str.length; i++)
        if (str[i] === "\0")
            return str.substring(0, i);
    return str + "...";
};

