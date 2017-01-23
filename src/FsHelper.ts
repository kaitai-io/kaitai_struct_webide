import { IFsItem } from "./FsInterfaces";

export default class FsHelper {
    public static selectNode(root: IFsItem, fn: string) {
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