import { bindable } from "aurelia-framework";
import "lib/DateFormatHelper";

declare function require(path: string): any;
var bigInt = require('lib/BigInteger/BigInteger.js');
declare var TextDecoder: any; // browser built-in

export class ConverterPanel {
    val = {
        u8: "",
        u16le: "",
        u32le: "",
        u64le: "",
        u16be: "",
        u32be: "",
        u64be: "",
        s8: "",
        s16le: "",
        s32le: "",
        s64le: "",
        s16be: "",
        s32be: "",
        s64be: "",
        float: "",
        double: "",
        unixts: "",
        ascii: "",
        utf8: "",
        utf16le: "",
        utf16be: "",
    }

    @bindable data: Uint8Array;

    dataChanged() {
        var data = this.data;
        console.log('dataChanged', data);

        function numConv(len, signed, bigEndian){
            if (len > data.length) return '';

            var arr = data.subarray(0, len);

            var num = bigInt(0);
            if (bigEndian)
                for (var i = 0; i < arr.length; i++)
                    num = num.multiply(256).add(arr[i]);
            else
                for (var i = arr.length - 1; i >= 0; i--)
                    num = num.multiply(256).add(arr[i]);

            if (signed) {
                var maxVal = bigInt(256).pow(len);
                if (num.greaterOrEquals(maxVal.divide(2)))
                    num = maxVal.minus(num).negate();
            }

            //console.log('numConv', arr, len, signed ? 'signed' : 'unsigned', bigEndian ? 'big-endian' : 'little-endian', num, typeof num);
            return num;
        };
        
        [1, 2, 4, 8].forEach(len => [false, true].forEach(signed => [false, true].forEach(bigEndian =>
            this.val[`${signed ? 's' : 'u'}${len * 8}${len === 1 ? '' : bigEndian ? 'be' : 'le'}`] = numConv(len, signed, bigEndian).toString())));
        
        var u32le = numConv(4, false, false);
        var unixtsDate = new Date(u32le * 1000);
        
        this.val.float = data.length >= 4 ? new Float32Array(data.buffer.slice(0, 4))[0].toString() : '';
        this.val.double = data.length >= 8 ? new Float64Array(data.buffer.slice(0, 8))[0].toString() : '';
        this.val.unixts = unixtsDate.format('Y-m-d H:i:s');
        
        function strDecode(enc) {
            var str = new TextDecoder(enc).decode(data);
            for (var i = 0; i < str.length; i++)
                if (str[i] === '\0')
                    return str.substring(0, i);
            return str + "...";
        }
        
        //console.log('refreshConverterPanel data', data);
        
        try {
            this.val.ascii = strDecode('ascii');
            this.val.utf8 = strDecode('utf-8');
            this.val.utf16le = strDecode('utf-16le');
            this.val.utf16be = strDecode('utf-16be');
        } catch (e) {
            console.log('refreshConverterPanel str', e);
        }
    }
}