// issue: https://github.com/Microsoft/TypeScript/issues/582
var myself = <Worker><any>self;

var wi = {
    MainClass: <any>null,
    ksyTypes: <IKsyTypes>null,
    inputBuffer: <ArrayBuffer>null,
    ioInput: <KaitaiStream>null,
    root: <any>null,
    exported: <IExportedValue>null,
};

var hooks = { nodeFilter: <(obj: any) => any> null };

declare function importScripts(...urls: string[]): void;

interface IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    incomplete: boolean;
    arr?: IDebugInfo[];
    enumName?: string;
}

function isUndef(obj: any) { return typeof obj === "undefined"; }

function getObjectType(obj: any) {
    if (obj instanceof Uint8Array)
        return ObjectType.TypedArray;
    else if (obj === null || typeof obj !== "object")
        return isUndef(obj) ? ObjectType.Undefined : ObjectType.Primitive;
    else if (Array.isArray(obj))
        return ObjectType.Array;
    else
        return ObjectType.Object;
}

function exportValue(obj: any, debug: IDebugInfo, path: string[], noLazy?: boolean): IExportedValue {
    adjustDebug(debug);
    var result: IExportedValue = {
        start: debug && debug.start,
        end: debug && debug.end,
        incomplete: debug && debug.incomplete,
        ioOffset: debug && debug.ioOffset,
        path: path,
        type: getObjectType(obj)
    };

    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined) {
        result.primitiveValue = obj;
        if (debug && debug.enumName) {
            result.enumName = debug.enumName;
            var enumObj = myself;
            var enumPath = debug.enumName.split(".");

            // Because of https://github.com/kaitai-io/kaitai_struct/issues/1074,
            // KSC-generated modules export a plain object (not the constructor
            // function directly) - for example, the exported value from the
            // `Zip.js` module is `{ Zip: function (_io, _parent, _root) {...} }`.
            //
            // This means we have to use the top-level name twice in the path resolution.
            enumPath.unshift(enumPath[0]);
            enumPath.forEach(p => enumObj = enumObj[p]);

            var flagCheck = 0, flagSuccess = true;
            var flagStr = Object.keys(enumObj).filter(x => isNaN(<any>x)).filter(x => {
                if (flagCheck & enumObj[x]) {
                    flagSuccess = false;
                    return false;
                }

                flagCheck |= enumObj[x];
                return obj & enumObj[x];
            }).join("|");

            //console.log(debug.enumName, enumObj, enumObj[obj], flagSuccess, flagStr);
            result.enumStringValue = enumObj[obj] || (flagSuccess && flagStr);
        }
    }
    else if (result.type === ObjectType.Array) {
        result.arrayItems = (<any[]>obj).map((item, i) => exportValue(item, debug && debug.arr && debug.arr[i], path.concat(i.toString()), noLazy));
    }
    else if (result.type === ObjectType.Object) {
        result.object = { class: obj.constructor.name, instances: {}, fields: {} };
        const ksyType = wi.ksyTypes[result.object.class];

        const fieldNames = new Set<string>(Object.keys(obj));
        if (obj._debug) {
            Object.keys(obj._debug).forEach(k => fieldNames.add(k));
        }
        const fieldNamesArr = Array.from(fieldNames).filter(x => x[0] !== "_");
        fieldNamesArr
            .forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug && obj._debug[key], path.concat(key), noLazy));

        const propNames = obj.constructor !== Object ?
            Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== "_" && x !== "constructor") : [];

        for (const propName of propNames) {
            const ksyInstanceData = ksyType && ksyType.instancesByJsName[propName] || {};
            const parseMode = ksyInstanceData["-webide-parse-mode"];
            const eagerLoad = parseMode === "eager" || (parseMode !== "lazy" && ksyInstanceData.value);

            if (eagerLoad || noLazy)
                result.object.fields[propName] = exportValue(obj[propName], obj._debug["_m_" + propName], path.concat(propName), noLazy);
            else
                result.object.instances[propName] = <IInstance>{ path: path.concat(propName), offset: 0 };
        }
    }
    else
        console.log(`Unknown object type: ${result.type}`);

    return result;
}

function adjustDebug(debug: IDebugInfo): void {
    if (!debug || Object.prototype.hasOwnProperty.call(debug, 'incomplete')) {
        return;
    }
    debug.incomplete = (debug.start != null && debug.end == null);
}

importScripts("../entities.js");
importScripts("../../lib/_npm/kaitai-struct/KaitaiStream.js");

(KaitaiStream as any).depUrls = (KaitaiStream as any).depUrls  || {};
(KaitaiStream as any).depUrls.zlib = "../../lib/_npm/pako/pako_inflate.min.js";

var apiMethods = {
    initCode: (sourceCode: string, mainClassName: string, ksyTypes: IKsyTypes) => {
        wi.ksyTypes = ksyTypes;
        eval(`${sourceCode}\nwi.MainClass = ${mainClassName}.${mainClassName};`);
    },
    setInput: (inputBuffer: ArrayBuffer) => wi.inputBuffer = inputBuffer,
    reparse: (eagerMode: boolean) => {
        //var start = performance.now();
        wi.ioInput = new KaitaiStream(wi.inputBuffer, 0);
        wi.root = new wi.MainClass(wi.ioInput);
        let error;
        try {
            wi.root._read();
        } catch (e) {
            error = e;
        }
        if (hooks.nodeFilter)
            wi.root = hooks.nodeFilter(wi.root);
        wi.exported = exportValue(wi.root, { start: 0, end: wi.inputBuffer.byteLength, ioOffset: 0, incomplete: error !== undefined }, [], eagerMode);
        //console.log("parse before return", performance.now() - start, "date", Date.now());
        return {
            result: wi.exported,
            error,
        };
    },
    get: (path: string[]) => {
        var obj = wi.root;
        var parent: any = null;
        path.forEach(key => { parent = obj; obj = obj[key]; });

        var debug = <IDebugInfo>parent._debug["_m_" + path[path.length - 1]];
        wi.exported = exportValue(obj, debug, path, false); //
        return {
            result: wi.exported,
        };
    }
};

myself.onmessage = (ev: MessageEvent) => {
    var msg = <IWorkerMessage>ev.data;
    //console.log("[Worker] Got msg", msg, ev);

    if (apiMethods.hasOwnProperty(msg.type)) {
        try {
            const ret = apiMethods[msg.type].apply(self, msg.args);
            if (ret) {
                const { result, error } =  ret;
                msg.result = result;
                msg.error = error;
            }
        } catch (error) {
            console.log("[Worker] Error", error);
            msg.error = error;
        }
    } else {
        msg.error = "msg.type is unknown";
    }

    //console.log("[Worker] Send response", msg, ev);
    myself.postMessage(msg);
};
