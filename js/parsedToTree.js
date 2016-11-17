;
;
function parsedToTree(jsTreeElement, exportedRoot, handleError, cb) {
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
            nodes.forEach(node => node.id = getNodeId(node));
            cb(nodes);
            handleError(null);
        }).catch(err => {
            cb([]);
            handleError(err);
        });
    }
    function getNodeId(node) { return 'inputField_' + (node.data.exported ? node.data.exported.path : node.data.propPath).join('_'); }
    var parsedTreeOpenedNodes = {};
    var parsedTreeOpenedNodesStr = localStorage.getItem('parsedTreeOpenedNodes');
    if (parsedTreeOpenedNodesStr)
        parsedTreeOpenedNodesStr.split(',').forEach(x => parsedTreeOpenedNodes[x] = true);
    var saveOpenedNodesDisabled = false;
    function saveOpenedNodes() {
        if (saveOpenedNodesDisabled)
            return;
        //parsedTreeOpenedNodes = {};
        //getAllNodes(ui.parsedDataTree).filter(x => x.state.opened).forEach(x => parsedTreeOpenedNodes[x.id] = true);
        localStorage.setItem('parsedTreeOpenedNodes', Object.keys(parsedTreeOpenedNodes).join(','));
    }
    jsTreeElement.jstree("destroy");
    var jstree = jsTreeElement.jstree({ core: { data: (node, cb) => getNode(node, cb), themes: { icons: false }, multiple: false } }).jstree(true);
    jstree.on = (...args) => jstree.element.on(...args);
    jstree.off = (...args) => jstree.element.off(...args);
    jstree.on('keyup.jstree', e => jstree.activate_node(e.target.id));
    jstree.on('ready.jstree', e => {
        jstree.openNodes(Object.keys(parsedTreeOpenedNodes), () => {
            jstree.on('open_node.jstree', (e, te) => {
                var node = te.node;
                parsedTreeOpenedNodes[getNodeId(node)] = true;
                saveOpenedNodes();
            }).on('close_node.jstree', (e, te) => {
                var node = te.node;
                delete parsedTreeOpenedNodes[getNodeId(node)];
                saveOpenedNodes();
            });
            cb();
        });
    });
    jstree.openNodes = (nodesToOpen, cb) => {
        if (!nodesToOpen || nodesToOpen.length === 0)
            return true;
        saveOpenedNodesDisabled = true;
        var origAnim = jstree.settings.core.animation;
        jstree.settings.core.animation = 0;
        //console.log('saveOpenedNodesDisabled = true');
        var openCallCounter = 1;
        function openRound(e) {
            openCallCounter--;
            //console.log('openRound', openCallCounter, nodesToOpen);
            var newNodesToOpen = [];
            var existingNodes = [];
            nodesToOpen.forEach(nodeId => {
                var node = jstree.get_node(nodeId);
                if (node) {
                    if (!node.state.opened)
                        existingNodes.push(node);
                }
                else
                    newNodesToOpen.push(nodeId);
            });
            nodesToOpen = newNodesToOpen;
            //console.log('existingNodes', existingNodes, 'openCallCounter', openCallCounter);
            if (existingNodes.length > 0)
                existingNodes.forEach(node => {
                    openCallCounter++;
                    //console.log(`open_node called on ${node.id}`)
                    jstree.open_node(node);
                });
            else if (openCallCounter === 0) {
                //console.log('saveOpenedNodesDisabled = false');
                saveOpenedNodesDisabled = false;
                e && jstree.off(e);
                jstree.settings.core.animation = origAnim;
                saveOpenedNodes();
                cb && cb(nodesToOpen.length === 0);
            }
        }
        jstree.on('open_node.jstree', e => openRound(e));
        openRound(null);
    };
    jstree.activatePath = (path, cb) => {
        var path = path.split('/');
        var expandNodes = [];
        var pathStr = 'inputField';
        for (var i = 0; i < path.length; i++) {
            pathStr += '_' + path[i];
            expandNodes.push(pathStr);
        }
        var activateId = expandNodes.pop();
        jstree.openNodes(expandNodes, foundAll => {
            //console.log('activatePath', foundAll, activateId);
            jstree.activate_node(activateId, null);
            $(`#${activateId}`).get(0).scrollIntoView();
            cb && cb(foundAll);
        });
    };
    return jstree;
}
//# sourceMappingURL=parsedToTree.js.map