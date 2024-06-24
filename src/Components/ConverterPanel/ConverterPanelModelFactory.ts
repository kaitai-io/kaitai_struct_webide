import {convertToInteger, convertToString, convertToDouble, convertToFloat, convertToTimestamp} from "./ConverterPanelMappers";

const LITTLE_ENDIAN = false;
const BIG_ENDIAN = true;
const UNSIGNED = false;
const SIGNED = true;

const ONE_BYTE = 1;
const TWO_BYTES = 2;
const FOUR_BYTES = 4;
const EIGHT_BYTES = 8;

export interface ConverterPanelModel {
    u8: string;
    s8: string;

    u16le: string;
    s16le: string;
    u32le: string;
    s32le: string;
    u64le: string;
    s64le: string;

    u16be: string;
    s16be: string;
    u32be: string;
    s32be: string;
    u64be: string;
    s64be: string;

    float: string;
    double: string;
    unixts: string;
    ascii: string;
    utf8: string;
    utf16le: string;
    utf16be: string;

}

export const prepareEmptyModel = (): ConverterPanelModel => {
    return {
        u8: "",
        s8: "",

        u16le: "",
        s16le: "",
        u32le: "",
        s32le: "",
        u64le: "",
        s64le: "",

        u16be: "",
        s16be: "",
        u32be: "",
        s32be: "",
        u64be: "",
        s64be: "",

        float: "",
        double: "",
        unixts: "",
        ascii: "",
        utf8: "",
        utf16le: "",
        utf16be: "",
    };
};
export const prepareModelData = (data: Uint8Array): ConverterPanelModel => {
    return {
        u8: convertToInteger(data, ONE_BYTE, UNSIGNED, BIG_ENDIAN),
        s8: convertToInteger(data, ONE_BYTE, SIGNED, BIG_ENDIAN),

        u16le: convertToInteger(data, TWO_BYTES, UNSIGNED, LITTLE_ENDIAN),
        s16le: convertToInteger(data, TWO_BYTES, SIGNED, LITTLE_ENDIAN),
        u32le: convertToInteger(data, FOUR_BYTES, UNSIGNED, LITTLE_ENDIAN),
        s32le: convertToInteger(data, FOUR_BYTES, SIGNED, LITTLE_ENDIAN),
        u64le: convertToInteger(data, EIGHT_BYTES, UNSIGNED, LITTLE_ENDIAN),
        s64le: convertToInteger(data, EIGHT_BYTES, SIGNED, LITTLE_ENDIAN),

        u16be: convertToInteger(data, TWO_BYTES, UNSIGNED, BIG_ENDIAN),
        s16be: convertToInteger(data, TWO_BYTES, SIGNED, BIG_ENDIAN),
        u32be: convertToInteger(data, FOUR_BYTES, UNSIGNED, BIG_ENDIAN),
        s32be: convertToInteger(data, FOUR_BYTES, SIGNED, BIG_ENDIAN),
        u64be: convertToInteger(data, EIGHT_BYTES, UNSIGNED, BIG_ENDIAN),
        s64be: convertToInteger(data, EIGHT_BYTES, SIGNED, BIG_ENDIAN),

        float: convertToFloat(data),
        double: convertToDouble(data),

        unixts: convertToTimestamp(data),

        ascii: convertToString(data, "ascii"),
        utf8: convertToString(data, "utf-8"),
        utf16le: convertToString(data, "utf-16le"),
        utf16be: convertToString(data, "utf-16be"),
    };
};