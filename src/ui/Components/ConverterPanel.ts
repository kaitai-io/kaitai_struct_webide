///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import * as bigInt from "big-integer";
import Component from "../Component";
import dateFormat = require("dateformat");
import { IDataProvider } from "../../HexViewer";

export class Converter {
    static numConv(data: Uint8Array, len: number, signed: boolean, bigEndian: boolean): string {
        if (len > data.length) return "";

        var arr = data.slice(0, len);

        if (!bigEndian)
            arr = arr.reverse();

        var num = bigInt(0);
        for (var i = 0; i < arr.length; i++)
            num = num.multiply(256).add(arr[i]);

        if (signed) {
            var maxVal = bigInt(256).pow(len);
            if (num.greaterOrEquals(maxVal.divide(2)))
                num = maxVal.minus(num).negate();
        }

        //console.log("numConv", arr, len, signed ? "signed" : "unsigned", bigEndian ? "big-endian" : "little-endian", num, typeof num);
        return num.toString();
    }

    static strDecode(data: Uint8Array, enc: string) {
        var str = new TextDecoder(enc).decode(data);
        for (var i = 0; i < str.length; i++)
            if (str[i] === "\0")
                return str.substring(0, i);
        return str + "...";
    }
}

export class ConverterPanelModel {
    i8: string = "";
    i16le: string = "";
    i32le: string = "";
    i64le: string = "";
    i16be: string = "";
    i32be: string = "";
    i64be: string = "";
    float: string = "";
    double: string = "";
    unixts: string = "";
    ascii: string = "";
    utf8: string = "";
    utf16le: string = "";
    utf16be: string = "";

    update(dataProvider: IDataProvider, offset: number) {
        if (!dataProvider || offset === -1) {
            Object.keys(this).forEach(x => this[x] = "");
            return;
        }

        var data = dataProvider.get(offset, Math.min(dataProvider.length - offset, 64)).slice(0);

        for (const len of [1, 2, 4, 8])
            for (const signed of [false, true])
                for (const bigEndian of [false, true]) {
                    var convRes = Converter.numConv(data, len, signed, bigEndian);
                    var propName = `${signed ? "s" : "u"}${len * 8}${len === 1 ? "" : bigEndian ? "be" : "le"}`;
                    this[propName] = convRes;
                }

        this.float = data.length >= 4 ? "" + new Float32Array(data.buffer.slice(0, 4))[0] : "";
        this.double = data.length >= 8 ? "" + new Float64Array(data.buffer.slice(0, 8))[0] : "";

        var u32le = Converter.numConv(data, 4, false, false);
        this.unixts = u32le ? dateFormat(new Date(parseInt(u32le) * 1000), "yyyy-mm-dd HH:MM:ss") : "";

        try {
            this.ascii = Converter.strDecode(data, "ascii");
            this.utf8 = Converter.strDecode(data, "utf-8");
            this.utf16le = Converter.strDecode(data, "utf-16le");
            this.utf16be = Converter.strDecode(data, "utf-16be");
        } catch (e) {
            console.log("refreshConverterPanel str", e);
        }
    }
}

@Component
export class ConverterPanel extends Vue {
    model: ConverterPanelModel;

    constructor() {
        super();
        this.model = this.model || new ConverterPanelModel();
    }
}
