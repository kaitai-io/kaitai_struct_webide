interface JSTreeNodeData { exported?: IExportedValue, propPath?: string[] };
interface JSTreeNode { id?: string, text?: string, icon?: string, children?: JSTreeNode[] | boolean, data?: JSTreeNodeData };

function parsedToTree(jsTree, exportedRoot: IExportedValue, handleError) {
    function primitiveToText(exported: IExportedValue): string {
        if (exported.type === ObjectType.Primitive)
            return exported.primitiveValue;
        else if (exported.type === ObjectType.TypedArray) {
            var text = '[';
            for (var i = 0; i < exported.bytes.byteLength; i++) {
                text += (i == 0 ? '' : ', ') + exported.bytes[i];
                if (i == 7) {
                    text += ", ...";
                    break;
                }
            }
            text += ']';

            return text;
        } else
            throw new Error("primitiveToText: object is not primitive!");
    }

    function childItemToNode(item: IExportedValue, showProp: boolean) {
        var propName = item.path.last();
        var isObject = item.type === ObjectType.Object;
        var isArray = item.type === ObjectType.Array;
        var text = (isArray ? `${propName}` : isObject ? `${propName} [${item.object.class}]` : (showProp ? `${propName} = ` : '') + primitiveToText(item));
        return <JSTreeNode>{ text: text, children: isObject || isArray, data: { exported: item } };
    }

    function exportedToNodes(exported: IExportedValue, showProp: boolean): JSTreeNode[] {
        if (exported.type === ObjectType.Undefined)
            return [];
        if (exported.type === ObjectType.Primitive || exported.type === ObjectType.TypedArray)
            return [childItemToNode(exported, showProp)];
        else if (exported.type === ObjectType.Array)
            return exported.arrayItems.map((item, i) => childItemToNode(item, true));
        else {
            var obj = exported.object;
            return Object.keys(obj.fields).map(fieldName => childItemToNode(obj.fields[fieldName], true)).concat(
                Object.keys(obj.propPaths).map(propName => <JSTreeNode>{ text: propName, children: true, data: { propPath: obj.propPaths[propName] } }));
        }
    }

    function getProp(path: string[]) {
        return new Promise<IExportedValue>((resolve, reject) => {
            jail.remote.get(path, (expProp: IExportedValue, error) => {
                if (expProp && !error)
                    resolve(expProp);
                else
                    reject(error);
            });
        })
    }

    function getNode(node: JSTreeNode, cb: (items: JSTreeNode[]) => void) {
        var expNode = node.id === '#' ? exportedRoot : node.data.exported;

        var valuePromise = expNode ? Promise.resolve(expNode) : getProp(node.data.propPath).then(exp => node.data.exported = exp);
        valuePromise.then(exp => {
            cb(exportedToNodes(exp, !!expNode));
            handleError(null);
        }).catch(err => {
            cb([]);
            handleError(err);
        });
    }

    jsTree.jstree("destroy");
    return jsTree.jstree({ core: { data: (node, cb) => getNode(node, cb), themes: { icons: false } } })
        .on('keyup.jstree', function (e) { jsTree.jstree(true).activate_node(e.target.id) });
}