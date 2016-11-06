function downloadFile(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
        xhr.onload = function (e) {
            resolve(this.response);
        };
        xhr.send();
    });
}
class Delayed {
    constructor(delay) {
        this.delay = delay;
    }
    do(func) {
        if (this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(function () {
            this.timeout = null;
            func();
        }, this.delay);
    }
}
if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count !== count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count === Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length === 0 || count === 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (;;) {
            if ((count & 1) === 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count === 0) {
                break;
            }
            str += str;
        }
        // Could we try:
        // return Array(count + 1).join(this);
        return rpt;
    };
}
function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    var binary = '';
    for (var i = 0; i < len; i++)
        binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
}
function readBlob(blob, mode, ...args) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function (e) { reject(e); };
        reader['readAs' + mode[0].toUpperCase() + mode.substr(1)](blob, ...args);
    });
}
function htmlescape(s) {
    return $("<div/>").text(s).html();
}
//# sourceMappingURL=utils.js.map