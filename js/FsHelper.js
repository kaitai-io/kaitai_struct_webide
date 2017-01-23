define(["require", "exports"], function (require, exports) {
    "use strict";
    class FsHelper {
        static selectNode(root, fn) {
            var currNode = root;
            var fnParts = fn.split('/');
            var currPath = '';
            for (var i = 0; i < fnParts.length; i++) {
                var fnPart = fnParts[i];
                currPath += (currPath ? '/' : '') + fnPart;
                if (!('children' in currNode)) {
                    currNode.children = {};
                    currNode.type = 'folder';
                }
                if (!(fnPart in currNode.children))
                    currNode.children[fnPart] = { fsType: root.fsType, type: 'file', fn: currPath };
                currNode = currNode.children[fnPart];
            }
            return currNode;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FsHelper;
});
//# sourceMappingURL=FsHelper.js.map