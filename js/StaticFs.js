define(["require", "exports"], function (require, exports) {
    "use strict";
    class StaticFs {
        constructor() {
            this.files = {};
        }
        getRootNode() { return Promise.resolve(Object.keys(this.files).map(fn => ({ fsType: 'static', type: 'file', fn }))); }
        get(fn) { return Promise.resolve(this.files[fn]); }
        put(fn, data) { this.files[fn] = data; return Promise.resolve(); }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StaticFs;
});
//# sourceMappingURL=StaticFs.js.map