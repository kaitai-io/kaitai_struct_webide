define(["require", "exports"], function (require, exports) {
    "use strict";
    class KaitaiFs {
        constructor(files) {
            this.files = files;
        }
        getRootNode() { return Promise.resolve(this.files); }
        get(fn) {
            if (fn.toLowerCase().endsWith('.ksy'))
                return Promise.resolve($.ajax({ url: fn }));
            else
                return downloadFile(fn);
        }
        put(fn, data) { return Promise.reject('KaitaiFs.put is not implemented!'); }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = KaitaiFs;
});
//# sourceMappingURL=KaitaiFs.js.map