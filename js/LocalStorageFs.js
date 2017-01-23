define(["require", "exports", "localforage", "./FsHelper"], function (require, exports, localforage, FsHelper_1) {
    "use strict";
    class LocalStorageFs {
        constructor(prefix) {
            this.prefix = prefix;
        }
        filesKey() { return `${this.prefix}_files`; }
        fileKey(fn) { return `${this.prefix}_file[${fn}]`; }
        save() { return localforage.setItem(this.filesKey(), this.root); }
        getRootNode() {
            if (this.root)
                return Promise.resolve(this.root);
            this.rootPromise = localforage.getItem(this.filesKey()).then(x => x || { fsType: 'local' }).then(r => this.root = r);
            return this.rootPromise;
        }
        setRootNode(newRoot) {
            this.root = newRoot;
            return this.save();
        }
        get(fn) { return localforage.getItem(this.fileKey(fn)); }
        put(fn, data) {
            return this.getRootNode().then(root => {
                var node = FsHelper_1.default.selectNode(root, fn);
                return Promise.all([localforage.setItem(this.fileKey(fn), data), this.save()]).then(x => node);
            });
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LocalStorageFs;
});
//# sourceMappingURL=LocalStorageFs.js.map