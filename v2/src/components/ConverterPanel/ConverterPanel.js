var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "aurelia-framework", "lib/DateFormatHelper"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var bigInt = require('lib/BigInteger/BigInteger.js');
    class ConverterPanel {
        constructor() {
            this.val = {
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
            };
        }
        dataChanged() {
            var data = this.data;
            console.log('dataChanged', data);
            function numConv(len, signed, bigEndian) {
                if (len > data.length)
                    return '';
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
            }
            ;
            [1, 2, 4, 8].forEach(len => [false, true].forEach(signed => [false, true].forEach(bigEndian => this.val[`${signed ? 's' : 'u'}${len * 8}${len === 1 ? '' : bigEndian ? 'be' : 'le'}`] = numConv(len, signed, bigEndian).toString())));
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
            }
            catch (e) {
                console.log('refreshConverterPanel str', e);
            }
        }
    }
    __decorate([
        aurelia_framework_1.bindable
    ], ConverterPanel.prototype, "data", void 0);
    exports.ConverterPanel = ConverterPanel;
});
//# sourceMappingURL=ConverterPanel.js.map