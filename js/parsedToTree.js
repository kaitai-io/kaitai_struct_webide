;
;
var autoExpandNodes = null;
function parsedToTree(jsTree, exportedRoot, handleError) {
    function primitiveToText(exported) {
        if (exported.type === ObjectType.Primitive)
            return exported.primitiveValue;
        else if (exported.type === ObjectType.TypedArray) {
            var text = '[';
            for (var i = 0; i < exported.bytes.byteLength; i++) {
                if (i == 8) {
                    text += ", ...";
                    break;
                }
                text += (i == 0 ? '' : ', ') + exported.bytes[i];
            }
            text += ']';
            return text;
        }
        else
            throw new Error("primitiveToText: object is not primitive!");
    }
    function childItemToNode(item, showProp) {
        var propName = item.path.last();
        var isObject = item.type === ObjectType.Object;
        var isArray = item.type === ObjectType.Array;
        var text = (isArray ? `${propName}` : isObject ? `${propName} [${item.object.class}]` : (showProp ? `${propName} = ` : '') + primitiveToText(item));
        return { text: text, children: isObject || isArray, data: { exported: item } };
    }
    function exportedToNodes(exported, showProp) {
        if (exported.type === ObjectType.Undefined)
            return [];
        if (exported.type === ObjectType.Primitive || exported.type === ObjectType.TypedArray)
            return [childItemToNode(exported, showProp)];
        else if (exported.type === ObjectType.Array)
            return exported.arrayItems.map((item, i) => childItemToNode(item, true));
        else {
            var obj = exported.object;
            return Object.keys(obj.fields).map(fieldName => childItemToNode(obj.fields[fieldName], true)).concat(Object.keys(obj.propPaths).map(propName => ({ text: propName, children: true, data: { propPath: obj.propPaths[propName] } })));
        }
    }
    function getProp(path) {
        return new Promise((resolve, reject) => {
            jail.remote.get(path, (expProp, error) => {
                if (expProp && !error)
                    resolve(expProp);
                else
                    reject(error);
            });
        });
    }
    function fixOffsets(exp, offset) {
        exp.start += offset;
        exp.end += offset;
        if (exp.type === ObjectType.Object) {
            var fieldNames = Object.keys(exp.object.fields);
            if (fieldNames.length > 0) {
                var objOffset = exp.object.fields[fieldNames[0]].start === 0 ? exp.start : 0;
                fieldNames.forEach(fieldName => fixOffsets(exp.object.fields[fieldName], objOffset));
            }
        }
        else if (exp.type === ObjectType.Array && exp.arrayItems.length > 0) {
            var objOffset = exp.arrayItems[0].start === 0 ? exp.start : 0;
            exp.arrayItems.forEach(item => fixOffsets(item, objOffset));
        }
    }
    function fillIntervals(exp) {
        if (exp.type === ObjectType.Object) {
            Object.keys(exp.object.fields).forEach(fieldName => fillIntervals(exp.object.fields[fieldName]));
        }
        else if (exp.type === ObjectType.Array)
            exp.arrayItems.forEach(item => fillIntervals(item));
        else if (exp.start < exp.end) {
            itree.add(exp.start, exp.end - 1, exp.path.join('/'));
        }
    }
    function getNode(node, cb) {
        var isRoot = node.id === '#';
        var expNode = isRoot ? exportedRoot : node.data.exported;
        var isInstance = !expNode;
        var valuePromise = isInstance ? getProp(node.data.propPath).then(exp => node.data.exported = exp) : Promise.resolve(expNode);
        valuePromise.then(exp => {
            if (isRoot || isInstance) {
                fixOffsets(exp, 0);
                fillIntervals(exp);
            }
            var nodes = exportedToNodes(exp, !isInstance);
            nodes.forEach(node => { if (node.data.exported)
                node.id = 'inputField_' + node.data.exported.path.join('_'); });
            cb(nodes);
            handleError(null);
        }).catch(err => {
            cb([]);
            handleError(err);
        });
    }
    jsTree.jstree("destroy");
    return jsTree.jstree({ core: { data: (node, cb) => getNode(node, cb), themes: { icons: false } } })
        .on('keyup.jstree', function (e) { jsTree.jstree(true).activate_node(e.target.id); })
        .on('open_node.jstree', () => openNodesIfCan());
}
//# sourceMappingURL=parsedToTree.js.map