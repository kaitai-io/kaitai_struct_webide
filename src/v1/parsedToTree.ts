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
                    this.getNode(node).then(x => cb(x), e => app.errors.handle(e)),
                themes: { icons: false },
                multiple: false,
                force_text: false,
                allow_reselect: true,
                loaded_state: true,
            },
            plugins: [ "state" ],
            state: {
                preserve_loaded: true,
                filter: function (state: Record<string, any>) {
                    const openNodes: string[] = state.core.open;
                    const nodesToLoad = new Set<string>();
                    for (const path of openNodes) {
                        const pathParts = path.split("-");
                        if (pathParts[0] !== "inputField") {
                            continue;
                        }
                        let subPath = pathParts.shift();
                        for (const part of pathParts) {
                            subPath += "-" + part;
                            if (this.is_loaded(subPath)) {
                                continue;
                            }
                            nodesToLoad.add(subPath);
                        }
                    }
                    // If we want to preserve the open state of nodes with closed parents,
                    // we must at least load their parents so that such nodes appear
                    // in the internal list of nodes that jsTree knows and the jsTree
                    // 'state' plugin can mark them as open.
                    state.core.loaded = Array.from(nodesToLoad);
                    return state;
                },
            },
        }).jstree(true);
        this.jstree.on = (...args: any[]) => (<any>this.jstree).get_container().on(...args);
        this.jstree.off = (...args: any[]) => (<any>this.jstree).get_container().off(...args);
        this.jstree.on("state_ready.jstree", () => {
            // These settings have been set to `true` only temporarily so that our
            // approach of populating the `state.core.loaded` property in the
            // `state.filter` function takes effect.
            this.jstree.settings.state.preserve_loaded = false;
            this.jstree.settings.core.loaded_state = false;

            this.updateActiveJstreeNode();
        });
        this.jstree.on("focus.jstree", ".jstree-anchor", e => {
            const focusedNode = e.currentTarget;
            if (!this.jstree.is_selected(focusedNode)) {
                this.jstree.deselect_all(true);
                this.jstree.select_node(focusedNode);
            }
        });
        this.intervalHandler = new IntervalHandler<IParsedTreeInterval>();
    }

    updateActiveJstreeNode(): void {
        const selectedNode = this.jstree.get_selected()[0];
        if (!selectedNode) {
            return;
        }
        // This ensures that next time the jsTree is focused (even when clicking
        // somewhere in the empty space of the jsTree pane without clicking or
        // hovering over any particular node first), the selected node (if any)
        // will be focused. If we don't do this, jsTree will instead focus the
        // most recently node that the user directly interacted with or (upon
        // page load) the very first node of the entire tree, which is not
        // ideal.
        //
        // As of jsTree 3.3.16, jsTree uses the `aria-activedescendant`
        // attribute as the only means of persisting the active node, so we
        // don't have much choice how to implement this.
        this.jstree.get_container().attr('aria-activedescendant', selectedNode);
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
            return s`<span class="missing">${"<no value>"}</span>`;
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

        if (item.incomplete || item.validationError !== undefined || item.instanceError !== undefined) {
            const validationError = item.validationError !== undefined ?
                `${item.validationError.name}: ${item.validationError.message}` :
                undefined;
            const instanceError = item.instanceError !== undefined ?
                `${item.instanceError.name}: ${item.instanceError.message}` :
                undefined;

            const showAsError =
                validationError !== undefined ||
                item.type === ObjectType.Undefined ||
                (item.type === ObjectType.Object && Object.keys(item.object.fields).length === 0);

            const icon = document.createElement('i');
            icon.classList.add('glyphicon');
            if (instanceError !== undefined) {
                icon.classList.add('instance-fail-color');
            } else {
                icon.classList.add(showAsError ? 'fail-color' : 'alert-color');
            }

            if (validationError !== undefined && (instanceError === undefined || item.instanceError === item.validationError)) {
                icon.classList.add('glyphicon-remove');
                const action = instanceError !== undefined ?
                    "validation of this instance parsed on explicit request" :
                    "validation of this field";
                icon.title = `${action} failed with "${validationError}"`;
            } else if (showAsError) {
                icon.classList.add('glyphicon-exclamation-sign');
                if (instanceError !== undefined) {
                    icon.title = `explicit parsing of this instance failed with "${instanceError}"`;
                } else {
                    icon.title = `parsing of this field failed`;
                }
            } else {
                icon.classList.add('glyphicon-alert');
                const instanceAppendix = instanceError !== undefined ? "explicit " : "";
                icon.title = `${instanceAppendix}parsing was interrupted by an error, data may be incomplete`;
            }

            text += ` ${icon.outerHTML}`;
        }

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
        var valuePromise = isInstance ? this.getProp(nodeData.instance.path).then(({ result: exp }) => nodeData.exported = exp) : Promise.resolve(expNode);
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
        return ["inputField", ...path].join("-");
    }

    activatePath(path: string|string[]): Promise<void> {
        const pathParts = typeof path === "string" ? path.split("/") : path;

        const nodesToLoad: string[] = [];
        let pathStr = "inputField";
        for (let i = 0; i < pathParts.length; i++) {
            pathStr += "-" + pathParts[i];
            nodesToLoad.push(pathStr);
        }
        const nodeToSelect = nodesToLoad.pop();

        return new Promise((resolve, reject) => {
            this.jstree.load_node(nodesToLoad, () => {
                // First select the node - the `select_node` method also recursively opens
                // all parents of the selected node by default.
                this.jstree.deselect_all(true);
                this.jstree.select_node(nodeToSelect);

                const element = this.jstree.get_node(nodeToSelect, true)[0];
                if (element) {
                    element.scrollIntoView();
                } else {
                    console.warn("element not found", nodeToSelect);
                }
                this.updateActiveJstreeNode();
                resolve();
            });
        });
    }
}
