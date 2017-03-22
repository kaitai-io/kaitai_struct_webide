var application: any, ioInput: any, root: any, parseError: any, KaitaiStream: any, exported: any,
    module: any, inputBuffer: any, MainClass: any, ksyTypes: any;

class IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    arr?: IDebugInfo[];
    enumName?: string;
}

function isUndef(obj) { return typeof obj === "undefined"; }

function getObjectType(obj) {
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
    var result = <IExportedValue>{ start: debug && debug.start, end: debug && debug.end, ioOffset: debug && debug.ioOffset, path: path, type: getObjectType(obj) };

    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined) {
        result.primitiveValue = obj;
        if (debug && debug.enumName) {
            result.enumName = debug.enumName;
            var enumObj = this;
            debug.enumName.split('.').forEach(p => enumObj = enumObj[p]);

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
        result.arrayItems = obj.map((item, i) => exportValue(item, debug && debug.arr[i], path.concat(i.toString()), noLazy));
    }
    else if (result.type === ObjectType.Object) {
        var childIoOffset = obj._io._byteOffset;

        if (result.start === childIoOffset) { // new KaitaiStream was used, fix start position
            result.ioOffset = childIoOffset;
            result.start -= childIoOffset;
            result.end -= childIoOffset;
        }

        result.object = { class: obj.constructor.name, instances: {}, fields: {} };
        var ksyType = ksyTypes[result.object.class];

        Object.keys(obj).filter(x => x[0] !== '_').forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug[key], path.concat(key), noLazy));

        Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== '_' && x !== "constructor").forEach(propName => {
            var ksyInstanceData = ksyType && ksyType.instancesByJsName[propName];
            var eagerLoad = ksyInstanceData && ksyInstanceData["-webide-parse-mode"] === "eager";

            if (eagerLoad || noLazy)
                result.object.fields[propName] = exportValue(obj[propName], obj._debug['_m_' + propName], path.concat(propName), noLazy);
            else
                result.object.instances[propName] = <IInstance>{ path: path.concat(propName), offset: 0 };
        });
    }
    else
        console.log(`Unknown object type: ${result.type}`);

    return result;
}

importScripts('entities.js');
importScripts('../lib/kaitai_js_runtime/KaitaiStream.js');

function define(name, deps, getter) { this[name] = getter(); };
(<any>define).amd = true;

var apiMethods = {
    eval: (code, args) => eval(code),
    reparse: (eagerMode) => {
        ioInput = new KaitaiStream(inputBuffer, 0);
        parseError = null;
        root = new MainClass(ioInput);
        root._read();
        exported = exportValue(root, <IDebugInfo>{ start: 0, end: inputBuffer.byteLength }, [], eagerMode);
        return exported;
    },
    get: (path: string[]) => {
        var obj = root;
        var parent = null;
        path.forEach(key => { parent = obj; obj = obj[key]; });

        var debug = <IDebugInfo>parent._debug['_m_' + path[path.length - 1]];
        exported = exportValue(obj, debug, path, false); //
        return exported;
    }
};

self.onmessage = ev => {
    var msg = <IWorkerMessage>ev.data;
    //console.log('[Worker] Got msg', msg, ev);

    if (apiMethods.hasOwnProperty(msg.type)) {
        try {
            msg.result = apiMethods[msg.type].apply(self, msg.args);
        } catch (error) {
            console.log('[Worker] Error', error);
            msg.error = error.toString();
        }
    } else {
        msg.error = "msg.type is unknown";
    }

    //console.log('[Worker] Send response', msg, ev);
    (<any>self).postMessage(msg);
}