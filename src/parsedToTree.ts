interface ParsedTreeNodeData { exported?: IExportedValue, instance?: IInstance };
interface JSTreeNode<TData> { id?: string, text?: string, icon?: string, children?: JSTreeNode<TData>[] | boolean, data?: TData };
interface ParsedTreeNode extends JSTreeNode<ParsedTreeNodeData> { }

interface JSTree {
    activatePath(path: string, cb?: (success: boolean) => void);
    openNodes(nodeIds: string[], cb?: (foundAll: boolean) => void);
}

function parsedToTree(jsTreeElement, exportedRoot: IExportedValue, ksySchema: KsySchema.IKsyFile, handleError, cb) {
    function primitiveToText(exported: IExportedValue, detailed: boolean = true): string {
        if (exported.type === ObjectType.Primitive) {
            var value = exported.primitiveValue;

            if (Number.isInteger(value)) {
                value = s`0x${value.toString(16).toUpperCase()}` + (detailed ? s`<span class="intVal"> = ${value}</span>` : '');

                if (exported.enumStringValue)
                    value = `${htmlescape(exported.enumStringValue)}` + (detailed ? ` <span class="enumDesc">(${value})</span>` : '');
            } else
                value = s`${value}`;

            return `<span class="primitiveValue">${value}</span>`;
        }
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

            return s`${text}`;
        } else
            throw new Error("primitiveToText: object is not primitive!");
    }

    function reprObject(obj: IExportedValue) {
        var repr = ((((obj.object.ksyType || <any>{}).extensions || {}).webide) || {}).representation;
        if (!repr) return "";

        function ksyNameToJsName(ksyName) { return ksyName.split('_').map((x,i) => (i === 0 ? x : x.ucFirst())).join(''); }

        return htmlescape(repr).replace(/{(.*?)}/g, (g0, g1) => {
            var currItem = obj;
            g1.split('.').forEach(k => currItem = currItem.object.fields[ksyNameToJsName(k)]);

            if (!currItem) return "";

            if (currItem.type === ObjectType.Object)
                return reprObject(currItem);
            else
                return primitiveToText(currItem, false);
        });
    }

    function childItemToNode(item: IExportedValue, showProp: boolean) {
        var propName = item.path.last();
        var isObject = item.type === ObjectType.Object;
        var isArray = item.type === ObjectType.Array;

        var text;
        if (isArray)
            text = s`${propName}`;
        else if (isObject) {
            var repr = reprObject(item);
            text = s`${propName} [<span class="className">${item.object.class}</span>]` + (repr ? `: ${repr}` : '');
        }
        else
            text = (showProp ? s`<span class="propName">${propName}</span> = ` : '') + primitiveToText(item);

        return <ParsedTreeNode>{ text: text, children: isObject || isArray, data: { exported: item } };
    }

    function exportedToNodes(exported: IExportedValue, showProp: boolean): ParsedTreeNode[] {
        if (exported.type === ObjectType.Undefined)
            return [];
        if (exported.type === ObjectType.Primitive || exported.type === ObjectType.TypedArray)
            return [childItemToNode(exported, showProp)];
        else if (exported.type === ObjectType.Array)
            return exported.arrayItems.map((item, i) => childItemToNode(item, true));
        else {
            var obj = exported.object;
            return Object.keys(obj.fields).map(fieldName => childItemToNode(obj.fields[fieldName], true)).concat(
                Object.keys(obj.instances).map(propName => <ParsedTreeNode>{ text: s`${propName}`, children: true, data: { instance: obj.instances[propName] } }));
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

    function fixOffsets(exp: IExportedValue, offset: number) {
        exp.start += offset;
        exp.end += offset;

        if (exp.type === ObjectType.Object) {
            var fieldNames = Object.keys(exp.object.fields);
            var objOffset = exp.object.fields[fieldNames[0]].start === 0 ? exp.start - offset : 0;
            fieldNames.forEach(fieldName => fixOffsets(exp.object.fields[fieldName], offset + objOffset));
            Object.keys(exp.object.instances).forEach(propName => exp.object.instances[propName].offset = offset);
        }
        else if (exp.type === ObjectType.Array && exp.arrayItems.length > 0) {
            //var objOffset = exp.arrayItems[0].start === 0 ? exp.start : 0;
            var objOffset = offset;
            exp.arrayItems.forEach(item => fixOffsets(item, objOffset));
        }
    }

    function fillIntervals(exp: IExportedValue) {
        if (exp.type === ObjectType.Object) {
            Object.keys(exp.object.fields).forEach(fieldName => fillIntervals(exp.object.fields[fieldName]));
        } else if (exp.type === ObjectType.Array)
            exp.arrayItems.forEach(item => fillIntervals(item));
        else if (exp.start < exp.end) {
            itree.add(exp.start, exp.end - 1, exp.path.join('/'));
        }
    }

    function fillKsyTypes(root: IExportedValue, schema: KsySchema.IKsyFile) {
        var types: { [name: string]: KsySchema.IType } = {};

        function ksyNameToJsName(ksyName) { return ksyName.split('_').map(x => x.ucFirst()).join(''); }

        function collectTypes(ts: { [name: string]: KsySchema.IType }) {
            if (!ts) return;
            Object.keys(ts).forEach(name => {
                types[ksyNameToJsName(name)] = ts[name];
                collectTypes(ts[name].types);
            });
        }

        collectTypes(schema.types);
        types[ksyNameToJsName(schema.meta.id)] = schema;

        function fillTypes(val: IExportedValue) {
            if (val.type === ObjectType.Object) {
                val.object.ksyType = types[val.object.class];
                Object.keys(val.object.fields).forEach(fieldName => fillTypes(val.object.fields[fieldName]));
            } else if (val.type === ObjectType.Array)
                val.arrayItems.forEach(item => fillTypes(item));
        }

        console.log('fillKsyTypes', root);
        fillTypes(root);
    }

    function getNode(node: ParsedTreeNode, cb: (items: ParsedTreeNode[]) => void) {
        var isRoot = node.id === '#';
        var expNode = isRoot ? exportedRoot : node.data.exported;

        var isInstance = !expNode;
        var valuePromise = isInstance ? getProp(node.data.instance.path).then(exp => node.data.exported = exp) : Promise.resolve(expNode);
        valuePromise.then(exp => {
            if (isRoot || isInstance) {
                //console.log('fixOffsets', node.text, node.data ? node.data.instance.offset : 0, exp, node);
                fillKsyTypes(exp, ksySchema);
                fixOffsets(exp, node.data ? node.data.instance.offset : 0);
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

    function getNodeId(node: ParsedTreeNode) { return 'inputField_' + (node.data.exported ? node.data.exported.path : node.data.instance.path).join('_'); }

    var parsedTreeOpenedNodes = {};
    var parsedTreeOpenedNodesStr = localStorage.getItem('parsedTreeOpenedNodes')
    if (parsedTreeOpenedNodesStr)
        parsedTreeOpenedNodesStr.split(',').forEach(x => parsedTreeOpenedNodes[x] = true);

    var saveOpenedNodesDisabled = false;
    function saveOpenedNodes() {
        if (saveOpenedNodesDisabled) return;

        //parsedTreeOpenedNodes = {};
        //getAllNodes(ui.parsedDataTree).filter(x => x.state.opened).forEach(x => parsedTreeOpenedNodes[x.id] = true);
        //console.log('saveOpenedNodes');
        localStorage.setItem('parsedTreeOpenedNodes', Object.keys(parsedTreeOpenedNodes).join(','));
    }

    jsTreeElement.jstree("destroy");
    var jstree = jsTreeElement.jstree({ core: { data: (node, cb) => getNode(node, cb), themes: { icons: false }, multiple: false, force_text: false } }).jstree(true);
    jstree.on = (...args) => jstree.element.on(...args);
    jstree.off = (...args) => jstree.element.off(...args);
    jstree.on('keyup.jstree', e => jstree.activate_node(e.target.id));
    jstree.on('ready.jstree', e => {
        jstree.openNodes(Object.keys(parsedTreeOpenedNodes), () => {
            jstree.on('open_node.jstree', (e, te) => {
                var node = <ParsedTreeNode>te.node;
                parsedTreeOpenedNodes[getNodeId(node)] = true;
                saveOpenedNodes();
            }).on('close_node.jstree', (e, te) => {
                var node = <ParsedTreeNode>te.node;
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
                if (node)
                {
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
            else if (openCallCounter === 0){
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
    }

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
        })
    };

    return jstree;
}