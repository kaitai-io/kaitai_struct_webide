;
;
function parsedToTree(jsTreeElement, exportedRoot, ksyTypes, handleError, cb) {
    function primitiveToText(exported, detailed = true) {
        if (exported.type === ObjectType.Primitive) {
            var value = exported.primitiveValue;
            if (Number.isInteger(value)) {
                value = s `${value < 0 ? '-' : ''}0x${Math.abs(value).toString(16).toUpperCase()}` + (detailed ? s `<span class="intVal"> = ${value}</span>` : '');
                if (exported.enumStringValue)
                    value = `${htmlescape(exported.enumStringValue)}` + (detailed ? ` <span class="enumDesc">(${value})</span>` : '');
            }
            else
                value = s `${value}`;
            return `<span class="primitiveValue">${value}</span>`;
        }
        else if (exported.type === ObjectType.TypedArray) {
            var text = '[';
            for (var i = 0; i < exported.bytes.byteLength; i++) {
                if (i === 8) {
                    text += ", ...";
                    break;
                }
                text += (i === 0 ? '' : ', ') + exported.bytes[i];
            }
            text += ']';
            return s `${text}`;
        }
        else
            throw new Error("primitiveToText: object is not primitive!");
    }
    function reprObject(obj) {
        var repr = obj.object.ksyType && obj.object.ksyType["-webide-representation"];
        if (!repr)
            return "";
        function ksyNameToJsName(ksyName) { return ksyName.split('_').map((x, i) => (i === 0 ? x : x.ucFirst())).join(''); }
        return htmlescape(repr).replace(/{(.*?)}/g, (g0, g1) => {
            var currItem = obj;
            var parts = g1.split(':');
            var format = { sep: ', ' };
            if (parts.length > 1)
                parts[1].split(',').map(x => x.split('=')).forEach(kv => format[kv[0]] = kv.length > 1 ? kv[1] : true);
            parts[0].split('.').forEach(k => {
                if (!currItem || !currItem.object)
                    currItem = null;
                else {
                    var child = k === "_parent" ? currItem.parent : currItem.object.fields[ksyNameToJsName(k)];
                    //if (!child)
                    //    console.log('[webrepr] child not found in object', currItem, k);
                    currItem = child;
                }
            });
            if (!currItem)
                return "";
            if (currItem.type === ObjectType.Object)
                return reprObject(currItem);
            else if (format.str && currItem.type === ObjectType.TypedArray)
                return s `"${asciiEncode(currItem.bytes)}"`;
            else if (format.hex && currItem.type === ObjectType.TypedArray)
                return s `${hexEncode(currItem.bytes)}`;
            else if (format.dec && currItem.type === ObjectType.Primitive && Number.isInteger(currItem.primitiveValue))
                return s `${currItem.primitiveValue}`;
            else if (currItem.type === ObjectType.Array) {
                var escapedSep = s `${format.sep}`;
                return currItem.arrayItems.map(item => reprObject(item)).join(escapedSep);
            }
            else
                return primitiveToText(currItem, false);
        });
    }
    var nodeDatas = [];
    kaitaiIde.nodeDatas = nodeDatas;
    function addNodeData(data) {
        var idx = nodeDatas.length;
        nodeDatas.push(data);
        return { idx: idx };
    }
    function getNodeData(node) {
        if (!node || !node.data) {
            console.log('no node data', node);
            return null;
        }
        return nodeDatas[node.data.idx];
    }
    function childItemToNode(item, showProp) {
        var propName = item.path.last();
        var isObject = item.type === ObjectType.Object;
        var isArray = item.type === ObjectType.Array;
        var text;
        if (isArray)
            text = s `${propName}`;
        else if (isObject) {
            var repr = reprObject(item);
            text = s `${propName} [<span class="className">${item.object.class}</span>]` + (repr ? `: ${repr}` : '');
        }
        else
            text = (showProp ? s `<span class="propName">${propName}</span> = ` : '') + primitiveToText(item);
        return { text: text, children: isObject || isArray, data: addNodeData({ exported: item }) };
    }
    function exportedToNodes(exported, showProp) {
        if (exported.type === ObjectType.Undefined)
            return [];
        if (exported.type === ObjectType.Primitive || exported.type === ObjectType.TypedArray)
            return [childItemToNode(exported, showProp)];
        else if (exported.type === ObjectType.Array)
            return exported.arrayItems.map((item, i) => childItemToNode(item, true));
        else if (exported.type === ObjectType.Object) {
            var obj = exported.object;
            return Object.keys(obj.fields).map(fieldName => childItemToNode(obj.fields[fieldName], true)).concat(Object.keys(obj.instances).map(propName => ({ text: s `${propName}`, children: true, data: addNodeData({ instance: obj.instances[propName], parent: exported }) })));
        }
        else
            throw new Error(`Unknown object type: ${exported.type}`);
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
    function getNode(node, cb) {
        var isRoot = node.id === '#';
        var nodeData = getNodeData(node);
        var expNode = isRoot ? exportedRoot : nodeData.exported;
        function fillKsyTypes(val) {
            if (val.type === ObjectType.Object) {
                val.object.ksyType = ksyTypes[val.object.class];
                Object.keys(val.object.fields).forEach(fieldName => fillKsyTypes(val.object.fields[fieldName]));
            }
            else if (val.type === ObjectType.Array)
                val.arrayItems.forEach(item => fillKsyTypes(item));
        }
        var isInstance = !expNode;
        var valuePromise = isInstance ? getProp(nodeData.instance.path).then(exp => nodeData.exported = exp) : Promise.resolve(expNode);
        valuePromise.then(exp => {
            if (isRoot || isInstance) {
                fillKsyTypes(exp);
                var intId = 0;
                function fillIntervals(exp) {
                    var objects = collectAllObjects(exp);
                    var typedArrays = objects.filter(exp => exp.type === ObjectType.TypedArray && exp.bytes.length > 64);
                    var intervals = objects.filter(exp => (exp.type === ObjectType.Primitive || exp.type === ObjectType.TypedArray) && exp.start < exp.end)
                        .map(exp => ({ start: exp.ioOffset + exp.start, end: exp.ioOffset + exp.end - 1, id: JSON.stringify({ id: intId++, path: exp.path.join('/') }) }))
                        .sort((a, b) => a.start - b.start);
                    var intervalsFiltered = [];
                    if (intervals.length > 0) {
                        intervalsFiltered = [intervals[0]];
                        intervals.slice(1).forEach(int => {
                            if (int.start > intervalsFiltered.last().end)
                                intervalsFiltered.push(int);
                        });
                    }
                    if (!isInstance) {
                        var nonParsed = [];
                        var lastEnd = -1;
                        intervalsFiltered.forEach(i => {
                            if (i.start !== lastEnd + 1)
                                nonParsed.push({ start: lastEnd + 1, end: i.start - 1 });
                            lastEnd = i.end;
                        });
                        ui.unparsedIntSel.setIntervals(nonParsed);
                        ui.bytesIntSel.setIntervals(typedArrays.map(exp => ({ start: exp.ioOffset + exp.start, end: exp.ioOffset + exp.end - 1 })));
                    }
                    intervalsFiltered.forEach(i => itree.add(i.start, i.end, i.id));
                }
                fillIntervals(exp);
                ui.hexViewer.setIntervalTree(itree);
            }
            function fillParents(value, parent) {
                //console.log('fillParents', value.path.join('/'), value, parent);
                value.parent = parent;
                if (value.type === ObjectType.Object) {
                    Object.keys(value.object.fields).forEach(fieldName => fillParents(value.object.fields[fieldName], value));
                }
                else if (value.type === ObjectType.Array)
                    value.arrayItems.forEach(item => fillParents(item, parent));
            }
            if (!exp.parent)
                fillParents(exp, nodeData && nodeData.parent);
            var nodes = exportedToNodes(exp, true);
            nodes.forEach(node => node.id = getNodeId(node));
            //console.log(exp, nodeData);
            cb(nodes);
            handleError(null);
        }).catch(err => {
            cb([]);
            handleError(err);
        });
    }
    function getNodeId(node) {
        var nodeData = getNodeData(node);
        return 'inputField_' + (nodeData.exported ? nodeData.exported.path : nodeData.instance.path).join('_');
    }
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
        //console.log('saveOpenedNodes');
        localStorage.setItem('parsedTreeOpenedNodes', Object.keys(parsedTreeOpenedNodes).join(','));
    }
    jsTreeElement.jstree("destroy");
    var jstree = jsTreeElement.jstree({ core: { data: (node, cb) => getNode(node, cb), themes: { icons: false }, multiple: false, force_text: false } }).jstree(true);
    jstree.getNodeData = getNodeData;
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
            if (foundAll) {
                var element = $(`#${activateId}`).get(0);
                if (element)
                    element.scrollIntoView();
                else {
                    console.log('element not found', activateId);
                }
            }
            cb && cb(foundAll);
        });
    };
    return jstree;
}
//# sourceMappingURL=parsedToTree.js.map