import {convertToDouble, convertToFloat, convertToInteger, convertToString, convertToTimestamp} from "./ConverterPanelMappers";

const LITTLE_ENDIAN = false;
const BIG_ENDIAN = true;
const UNSIGNED = false;
const SIGNED = true;

const ONE_BYTE = 1;
const TWO_BYTES = 2;
const FOUR_BYTES = 4;
const EIGHT_BYTES = 8;

export interface ConverterPanelModel {
    simpleTypes: SimpleType[];
    complexTypes: ComplexType[];
    strings: ComplexType[];
}

interface SimpleType {
    label: string;
    signedValue: string;
    unsignedValue: string;
}

interface ComplexType {
    label: string;
    value: string;
}



const emptySimpleTypeOf = (label: string): SimpleType => {
    return {
        label: label,
        unsignedValue: "",
        signedValue: ""
    };
};

const simpleTypeOf = (data: Uint8Array, label: string, lengthInBytes: number, bigEndian: boolean): SimpleType => {
    return {
        label: label,
        unsignedValue: convertToInteger(data, lengthInBytes, UNSIGNED, bigEndian),
        signedValue: convertToInteger(data, lengthInBytes, SIGNED, bigEndian)
    };
};

const complexTypeOf = (label: string, value: string): ComplexType => {
    return {
        label: label,
        value: value
    };
};

export const prepareEmptyModel = (): ConverterPanelModel => {
    return {
        simpleTypes: [
            emptySimpleTypeOf("i8"),
            emptySimpleTypeOf("i16le"),
            emptySimpleTypeOf("i32le"),
            emptySimpleTypeOf("i64le"),
            emptySimpleTypeOf("i16be"),
            emptySimpleTypeOf("i32be"),
            emptySimpleTypeOf("i64be")
        ],
        complexTypes: [
            complexTypeOf("float", ""),
            complexTypeOf("double", ""),
            complexTypeOf("unixts", "")
        ],
        strings: [
            complexTypeOf("ascii", ""),
            complexTypeOf("utf8", ""),
            complexTypeOf("utf16le", ""),
            complexTypeOf("utf16be", ""),
        ],
    };
};

export const prepareModelData = (data: Uint8Array): ConverterPanelModel => {
    return {
        simpleTypes: [
            simpleTypeOf(data, "i8", ONE_BYTE, BIG_ENDIAN),
            simpleTypeOf(data, "i16le", TWO_BYTES, LITTLE_ENDIAN),
            simpleTypeOf(data, "i32le", FOUR_BYTES, LITTLE_ENDIAN),
            simpleTypeOf(data, "i64le", EIGHT_BYTES, LITTLE_ENDIAN),
            simpleTypeOf(data, "i16be", TWO_BYTES, BIG_ENDIAN),
            simpleTypeOf(data, "i32be", FOUR_BYTES, BIG_ENDIAN),
            simpleTypeOf(data, "i64be", EIGHT_BYTES, BIG_ENDIAN),
        ],
        complexTypes: [
            complexTypeOf("float", convertToFloat(data)),
            complexTypeOf("double", convertToDouble(data)),
            complexTypeOf("unixts", convertToTimestamp(data))
        ],
        strings: [
            complexTypeOf("ascii", convertToString(data, "ascii")),
            complexTypeOf("utf8", convertToString(data, "utf-8")),
            complexTypeOf("utf16le", convertToString(data, "utf-16le")),
            complexTypeOf("utf16be", convertToString(data, "utf-16be")),
        ],
    };
};