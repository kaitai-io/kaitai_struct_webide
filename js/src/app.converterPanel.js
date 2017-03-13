define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function refreshConverterPanel(panel, dataProvider, offset) {
        if (dataProvider && offset != -1) {
            var data = dataProvider.get(offset, Math.min(dataProvider.length - offset, 64)).slice(0);
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
            [1, 2, 4, 8].forEach(len => [false, true].forEach(signed => [false, true].forEach(bigEndian => panel.find(`.i${len * 8}${len == 1 ? '' : bigEndian ? 'be' : 'le'} .${signed ? 'signed' : 'unsigned'}`).text(numConv(len, signed, bigEndian).toString()))));
            var u32le = numConv(4, false, false);
            var unixtsDate = new Date(u32le * 1000);
            panel.find(`.float .val`).text(data.length >= 4 ? new Float32Array(data.buffer.slice(0, 4))[0] : '');
            panel.find(`.double .val`).text(data.length >= 8 ? new Float64Array(data.buffer.slice(0, 8))[0] : '');
            panel.find(`.unixts .val`).text(unixtsDate.format('Y-m-d H:i:s'));
            function strDecode(enc) {
                var str = new TextDecoder(enc).decode(data);
                for (var i = 0; i < str.length; i++)
                    if (str[i] === '\0')
                        return str.substring(0, i);
                return str + "...";
            }
            //console.log('refreshConverterPanel data', data);
            try {
                panel.find(`.ascii   .val`).text(strDecode('ascii'));
                panel.find(`.utf8    .val`).text(strDecode('utf-8'));
                panel.find(`.utf16le .val`).text(strDecode('utf-16le'));
                panel.find(`.utf16be .val`).text(strDecode('utf-16be'));
            }
            catch (e) {
                console.log('refreshConverterPanel str', e);
            }
        }
        else
            panel.find('.val').text('');
    }
    exports.refreshConverterPanel = refreshConverterPanel;
});
//# sourceMappingURL=app.converterPanel.js.map