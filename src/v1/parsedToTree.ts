import { IInterval, IntervalHandler } from "../utils/IntervalHelper";
import { s, htmlescape, asciiEncode, hexEncode, uuidEncode, collectAllObjects } from "../utils";
import { workerMethods } from "./app.worker";
import { app } from "./app";

interface IParsedTreeNodeData {
    exported?: IExportedValue;
    instance?: IInstance;
    parent?: IExportedValue;
    arrayStart?: number;
    arrayEnd?: number;
}

export interface IJSTreeNode<TData> {
    id?: string;
    text?: string;
    icon?: string;
    children?: IJSTreeNode<TData>[] | boolean;
    data?: TData;
}

export interface IParsedTreeNode extends IJSTreeNode<{idx:number}> { }

interface IParsedTreeInterval extends IInterval {
    exp: IExportedValue;
}

export class ParsedTreeHandler {
    public jstree: JSTree;
    public intervalHandler: IntervalHandler<IParsedTreeInterval>;

    public constructor(public jsTreeElement: any, public exportedRoot: IExportedValue, public ksyTypes: IKsyTypes) {
        jsTreeElement.jstree("destroy");
        this.jstree = jsTreeElement.jstree({
            core: {
                data: (node: IParsedTreeNode, cb: any) =>
                    this.getNode(node).then(x => cb(x), e => app.errors.handle(e)), themes: { icons: false }, multiple: false, force_text: false
            }
        }).jstree(true);
        this.jstree.on = (...args: any[]) => (<any>this.jstree).element.on(...args);
        this.jstree.off = (...args: any[]) => (<any>this.jstree).element.off(...args);
        this.jstree.on("keyup.jstree", e => this.jstree.activate_node(e.target.id, null));
        this.intervalHandler = new IntervalHandler<IParsedTreeInterval>();
    }

    private parsedTreeOpenedNodes: { [id: string]: boolean } = {};
    private saveOpenedNodesDisabled = false;

    private saveOpenedNodes() {
        if (this.saveOpenedNodesDisabled) return;
        localStorage.setItem("parsedTreeOpenedNodes", Object.keys(this.parsedTreeOpenedNodes).join(","));
    }

    public initNodeReopenHandling() {
        var parsedTreeOpenedNodesStr = localStorage.getItem("parsedTreeOpenedNodes");
        if (parsedTreeOpenedNodesStr)
            parsedTreeOpenedNodesStr.split(",").forEach(x => this.parsedTreeOpenedNodes[x] = true);

        return new Promise((resolve, reject) => {
            this.jstree.on("ready.jstree", _ => {
                this.openNodes(Object.keys(this.parsedTreeOpenedNodes)).then(() => {
                    this.jstree.on("open_node.jstree", (e, te) => {
                        var node = <IParsedTreeNode>te.node;
                        this.parsedTreeOpenedNodes[this.getNodeId(node)] = true;
                        this.saveOpenedNodes();
                    }).on("close_node.jstree", (e, te) => {
                        var node = <IParsedTreeNode>te.node;
                        delete this.parsedTreeOpenedNodes[this.getNodeId(node)];
                        this.saveOpenedNodes();
                    });

                    resolve();
                }, err => reject(err));
            });
        });
    }

    primitiveToText(exported: IExportedValue, detailed: boolean = true): string {
        if (exported.type === ObjectType.Primitive) {
            var value = exported.primitiveValue;

            if (Number.isInteger(value)) {
                value = s`${value < 0 ? "-" : ""}0x${Math.abs(value).toString(16).toUpperCase()}`
                    + (detailed ? s`<span class="intVal"> = ${value}</span>` : "");

                if (exported.enumStringValue)
                    value = `${htmlescape(exported.enumStringValue)}` + (detailed ? ` <span class="enumDesc">(${value})</span>` : "");
            } else
                value = s`${value}`;

            return `<span class="primitiveValue">${value}</span>`;
        }
        else if (exported.type === ObjectType.TypedArray) {
            var text = "[";
            for (var i = 0; i < exported.bytes.byteLength; i++) {
                if (i === 8) {
                    text += ", ...";
                    break;
                }
                text += (i === 0 ? "" : ", ") + exported.bytes[i];
            }
            text += "]";

            return s`${text}`;
        } else if (exported.type === ObjectType.Undefined) {
            return s`<span class="missing">${"<no value>"}<span>`;
        } else
            throw new Error(`primitiveToText: object is not primitive: ${exported.type}!`);
    }

    reprObject(obj: IExportedValue): string {
        var repr = obj.object.ksyType && obj.object.ksyType["-webide-representation"];
        if (!repr) return "";

        function ksyNameToJsName(ksyName: string) { return ksyName.split("_").map((x, i) => (i === 0 ? x : x.ucFirst())).join(""); }

        return htmlescape(repr).replace(/{(.*?)}/g, (g0, g1: string) => {
            var currItem = obj;
            var parts = g1.split(":");

            var format: { sep:string, str?:string, hex?:string, dec?:string, uuid?:string, flags?:string } = { sep: ", " };
            if (parts.length > 1)
                parts[1].split(",").map(x => x.split("=")).forEach(kv => format[kv[0]] = kv.length > 1 ? kv[1] : true);
            parts[0].split(".").forEach(k => {
                if (!currItem || !currItem.object)
                    currItem = null;
                else {
                    var child = k === "_parent" ? currItem.parent : k === "this" ? currItem : currItem.object.fields[ksyNameToJsName(k)];
                    //if (!child)
                    //    console.log("[webrepr] child not found in object", currItem, k);
                    currItem = child;
                }
            });

            if (!currItem) return "";

            if (format.flags && currItem.type === ObjectType.Object) {
                const values = Object.keys(currItem.object.fields).filter(x => currItem.object.fields[x].primitiveValue === true);
                return values.length > 0 ? values.map(x => s`<span class="flags">${x}</span>`).join("|") : "🚫";
            } else if (currItem.type === ObjectType.Object)
                return this.reprObject(currItem);
            else if (format.str && currItem.type === ObjectType.TypedArray)
                return s`"${asciiEncode(currItem.bytes)}"`;
            else if (format.hex && currItem.type === ObjectType.TypedArray)
                return s`${hexEncode(currItem.bytes)}`;
            else if (format.uuid && currItem.type === ObjectType.TypedArray && currItem.bytes.byteLength === 16)
                return s`${uuidEncode(currItem.bytes, format.uuid === "ms")}`;
            else if (format.dec && currItem.type === ObjectType.Primitive && Number.isInteger(currItem.primitiveValue))
                return s`${currItem.primitiveValue}`;
            else if (currItem.type === ObjectType.Array) {
                var escapedSep = s`${format.sep}`;
                return currItem.arrayItems.map(item => this.reprObject(item)).join(escapedSep);
            }
            else
                return this.primitiveToText(currItem, false);
        });
    }

    public nodeDatas: IParsedTreeNodeData[] = [];

    addNodeData(data: IParsedTreeNodeData) {
        var idx = this.nodeDatas.length;
        this.nodeDatas.push(data);
        return { idx: idx };
    }

    getNodeData(node: IParsedTreeNode) {
        if (!node || !node.data) {
            console.log("no node data", node);
            return null;
        }
        return this.nodeDatas[node.data.idx];
    }

    childItemToNode(item: IExportedValue, showProp: boolean) {
        var propName = item.path.last();
        var isObject = item.type === ObjectType.Object;
        var isArray = item.type === ObjectType.Array;

        var text;
        if (isArray)
            text = s`${propName}`;
        else if (isObject) {
            var repr = this.reprObject(item);
            text = s`${propName} [<span class="className">${item.object.class}</span>]` + (repr ? `: ${repr}` : "");
        }
        else
            text = (showProp ? s`<span class="propName">${propName}</span> = ` : "") + this.primitiveToText(item);

        return <IParsedTreeNode>{ text: text, children: isObject || isArray, data: this.addNodeData({ exported: item }) };
    }

    exportedToNodes(exported: IExportedValue, nodeData: IParsedTreeNodeData, showProp: boolean): IParsedTreeNode[] {
        if (exported.type === ObjectType.Undefined)
            return [];
        if (exported.type === ObjectType.Primitive || exported.type === ObjectType.TypedArray)
            return [this.childItemToNode(exported, showProp)];
        else if (exported.type === ObjectType.Array) {
            var arrStart = nodeData && nodeData.arrayStart || 0;
            var arrEnd = nodeData && nodeData.arrayEnd || exported.arrayItems.length - 1;
            var items = exported.arrayItems.slice(arrStart, arrEnd + 1);

            const levelItemLimit = 100;

            if (items.length > 1000) {
                var childLevelItems = 1;
                var currentLevelItems = items.length;
                while (currentLevelItems > levelItemLimit) {
                    childLevelItems *= levelItemLimit;
                    currentLevelItems /= levelItemLimit;
                }

                var result = [];
                for (var i = 0; i < currentLevelItems; i++) {
                    var data = <IParsedTreeNodeData>{
                        exported: exported,
                        arrayStart: arrStart + i * childLevelItems,
                        arrayEnd: Math.min(arrStart + (i + 1) * childLevelItems, exported.arrayItems.length) - 1
                    };

                    result.push(<IParsedTreeNode>{
                        text: `[${data.arrayStart} … ${data.arrayEnd}]`,
                        children: true,
                        data: this.addNodeData(data),
                        id: this.getNodeId(data)
                    });
                }
                return result;
            }

            return items.map(item => this.childItemToNode(item, true));
        } else if (exported.type === ObjectType.Object) {
            var obj = exported.object;
            return Object.keys(obj.fields).map(fieldName => this.childItemToNode(obj.fields[fieldName], true)).concat(
                Object.keys(obj.instances).map(propName => <IParsedTreeNode>{
                    text: s`${propName}`,
                    children: true,
                    data: this.addNodeData({
                        instance: obj.instances[propName],
                        parent: exported
                    })
                }));
        } else
            throw new Error(`Unknown object type: ${exported.type}`);
    }

    getProp(path: string[]) {
        return workerMethods.get(path);
    }

    fillKsyTypes(val: IExportedValue) {
        if (val.type === ObjectType.Object) {
            val.object.ksyType = this.ksyTypes[val.object.class];
            Object.keys(val.object.fields).forEach(fieldName => this.fillKsyTypes(val.object.fields[fieldName]));
        } else if (val.type === ObjectType.Array)
            val.arrayItems.forEach(item => this.fillKsyTypes(item));
    }

    getNode(node: IParsedTreeNode): Promise<IParsedTreeNode[]> {
        var isRoot = node.id === "#";
        var nodeData = this.getNodeData(node);
        var expNode = isRoot ? this.exportedRoot : nodeData.exported;

        var isInstance = !expNode;
        var valuePromise = isInstance ? this.getProp(nodeData.instance.path).then(exp => nodeData.exported = exp) : Promise.resolve(expNode);
        return valuePromise.then(valueExp => {
            if (isRoot || isInstance) {
                this.fillKsyTypes(valueExp);

                var intervals: IParsedTreeInterval[] = [];
                var fillIntervals = (rootExp: IExportedValue) => {
                    var objects = collectAllObjects(rootExp);

                    var lastEnd = -1;
                    for (let exp of objects) {
                        if (!(exp.type === ObjectType.Primitive || exp.type === ObjectType.TypedArray)) continue;

                        var start = exp.ioOffset + exp.start;
                        var end = exp.ioOffset + exp.end - 1;
                        if (Number.isNaN(start) || Number.isNaN(end) || start <= lastEnd || start > end) continue;
                        lastEnd = end;

                        intervals.push(<IParsedTreeInterval>{ start: start, end: end, exp: exp });
                    }

                    if (!isInstance) {
                        var nonParsed: IInterval[] = [];

                        lastEnd = -1;
                        for (var i of intervals){
                            if (i.start !== lastEnd + 1)
                                nonParsed.push({ start: lastEnd + 1, end: i.start - 1 });

                            lastEnd = i.end;
                        }

                        app.vm.unparsed = nonParsed;
                        app.vm.byteArrays = objects.filter(exp => exp.type === ObjectType.TypedArray && exp.bytes.length > 64).
                            map(exp => ({ start: exp.ioOffset + exp.start, end: exp.ioOffset + exp.end - 1 }));
                    }

                    if (intervals.length > 400000)
                        console.warn("Too many items for interval tree: " + intervals.length);
                    else
                        this.intervalHandler.addSorted(intervals);
                };

                fillIntervals(valueExp);

                app.ui.hexViewer.setIntervals(this.intervalHandler);
            }

            function fillParents(value: IExportedValue, parent: IExportedValue) {
                //console.log("fillParents", value.path.join("/"), value, parent);
                value.parent = parent;
                if (value.type === ObjectType.Object) {
                    Object.keys(value.object.fields).forEach(fieldName => fillParents(value.object.fields[fieldName], value));
                } else if (value.type === ObjectType.Array)
                    value.arrayItems.forEach(item => fillParents(item, parent));
            }

            if (!valueExp.parent)
                fillParents(valueExp, nodeData && nodeData.parent);

            this.jstree.set_text(node, this.childItemToNode(valueExp, true).text);

            var nodes = this.exportedToNodes(valueExp, nodeData, true);
            nodes.forEach(x => x.id = x.id || this.getNodeId(x));
            return nodes;
        });
    }

    getNodeId(nodeOrNodeData: IParsedTreeNode | IParsedTreeNodeData) {
        var nodeData = (<IParsedTreeNode>nodeOrNodeData).data ? this.getNodeData(<IParsedTreeNode>nodeOrNodeData) : <IParsedTreeNodeData>nodeOrNodeData;
        var path = nodeData.exported ? nodeData.exported.path : nodeData.instance.path;
        if (nodeData.arrayStart || nodeData.arrayEnd)
            path = path.concat([`${nodeData.arrayStart || 0}`, `${nodeData.arrayEnd || 0}`]);
        return "inputField_" + path.join("_");
    }

    openNodes(nodesToOpen: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.saveOpenedNodesDisabled = true;
            var origAnim = (<any>this.jstree).settings.core.animation;
            (<any>this.jstree).settings.core.animation = 0;
            //console.log("saveOpenedNodesDisabled = true");

            var openCallCounter = 1;
            var openRound = (e: any) => {
                openCallCounter--;
                //console.log("openRound", openCallCounter, nodesToOpen);

                var newNodesToOpen: string[] = [];
                var existingNodes: string[] = [];
                nodesToOpen.forEach(nodeId => {
                    var node = this.jstree.get_node(nodeId);
                    if (node) {
                        if (!node.state.opened)
                            existingNodes.push(node);
                    } else
                        newNodesToOpen.push(nodeId);
                });
                nodesToOpen = newNodesToOpen;

                //console.log("existingNodes", existingNodes, "openCallCounter", openCallCounter);

                if (existingNodes.length > 0)
                    existingNodes.forEach(node => {
                        openCallCounter++;
                        //console.log(`open_node called on ${node.id}`)
                        this.jstree.open_node(node);
                    });
                else if (openCallCounter === 0) {
                    //console.log("saveOpenedNodesDisabled = false");
                    this.saveOpenedNodesDisabled = false;
                    if (e)
                        this.jstree.off(e);
                    (<any>this.jstree).settings.core.animation = origAnim;
                    this.saveOpenedNodes();

                    resolve(nodesToOpen.length === 0);
                }
            };

            this.jstree.on("open_node.jstree", e => openRound(e));
            openRound(null);
        });
    }

    activatePath(path: string|string[]): Promise<boolean> {
        var pathParts = typeof path === "string" ? path.split("/") : path;

        var expandNodes = [];
        var pathStr = "inputField";
        for (var i = 0; i < pathParts.length; i++) {
            pathStr += "_" + pathParts[i];
            expandNodes.push(pathStr);
        }
        var activateId = expandNodes.pop();

        return this.openNodes(expandNodes).then(foundAll => {
            //console.log("activatePath", foundAll, activateId);
            this.jstree.activate_node(activateId, null);

            if (foundAll) {
                var element = $(`#${activateId}`).get(0);
                if (element)
                    element.scrollIntoView();
                else {
                    console.log("element not found", activateId);
                }
            }

            return foundAll;
        });
    }
}
