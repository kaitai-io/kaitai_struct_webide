function parsedToTree(jsTree, res, handleError) {
    function getNodeItem(prop, value, debugExtra, expandObject) {
        var isByteArray = value instanceof Uint8Array;
        var isObject = typeof value === "object" && !isByteArray;
        var debug = value._debug || {};
        for (var key in debugExtra)
            debug[key] = debugExtra[key];
        if (debug.arr)
            value._debug = debug.arr;
        if (debug && debug.start && debug.end) {
            var node = itree.add(debug.start, debug.end);
            node.debug = debug;
        }
        var text;
        if (isObject) {
            if (expandObject) {
                console.log(value);
                return objectToNodes(value);
            }
            else
                text = `${prop} [${debug.class}]`;
        }
        else if (isByteArray) {
            text = (prop ? prop + ' = ' : '') + '[';
            for (var i = 0; i < value.length; i++) {
                text += (i == 0 ? '' : ', ') + value[i];
                if (i == 7) {
                    text += ", ...";
                    break;
                }
            }
            text += ']';
        }
        else
            text = `${prop} = ${value}`;
        var result = { text: text, children: isObject, data: { obj: value, debug: debug }, icon: false };
        return expandObject ? [result] : result;
    }
    function objectToNodes(obj) {
        //console.log('getNode', obj);
        var childNodes = Object.keys(obj).filter(x => x[0] != '_').map(prop => getNodeItem(prop, obj[prop], obj._debug ? obj._debug[prop] : null, false));
        if (obj._props) {
            childNodes = childNodes.concat(Object.keys(obj._props).map(key => {
                return { text: key, children: true, data: { getPath: obj._props[key] }, icon: false };
            }));
        }
        return childNodes;
    }
    function getNode(node, cb) {
        var obj = node.id === '#' ? res : node.data.obj;
        if (!obj) {
            if (node.data.getPath)
                jail.remote.get(node.data.getPath, (res, debug, error) => {
                    console.log('getNode', res, 'debug', debug);
                    handleError(error);
                    if (res && !error) {
                        var nodeItems = getNodeItem(null, res, debug, true);
                        node.data.debug = debug;
                        cb(nodeItems);
                    }
                    else
                        cb([]);
                });
            else
                cb([]);
        }
        else {
            var nodeItems = objectToNodes(obj);
            cb(nodeItems);
        }
    }
    jsTree.jstree("destroy");
    return jsTree.jstree({ core: { data: (node, cb) => getNode(node, cb) } })
        .on('keyup.jstree', function (e) { jsTree.jstree(true).activate_node(e.target.id); });
}
//# sourceMappingURL=parsedToTree.js.map