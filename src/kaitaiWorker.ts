var wi = { ioInput: <any>null, root: <any>null, parseError: <any>null, exported: <any>null, inputBuffer: <any>null, MainClass: <any>null, ksyTypes: <any>null };
var KaitaiStream: any, module: any;
declare function importScripts(...urls: string[]): void;

class IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
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
        result.arrayItems = (<any[]>obj).map((item, i) => exportValue(item, debug && debug.arr[i], path.concat(i.toString()), noLazy));
    }
    else if (result.type === ObjectType.Object) {
        var childIoOffset = obj._io._byteOffset;

        if (result.start === childIoOffset) { // new KaitaiStream was used, fix start position
            result.ioOffset = childIoOffset;
            result.start -= childIoOffset;
            result.end -= childIoOffset;
        }

        result.object = { class: obj.constructor.name, instances: {}, fields: {} };
        var ksyType = wi.ksyTypes[result.object.class];

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

function define(name: string, deps: any, getter: any) { this[name] = getter(); };
(<any>define).amd = true;

var apiMethods = {
    eval: (code: string, args: any[]) => eval(code),
    reparse: (eagerMode: boolean) => {
        var start = performance.now();
        wi.ioInput = new KaitaiStream(wi.inputBuffer, 0);
        wi.parseError = null;
        wi.root = new wi.MainClass(wi.ioInput);
        wi.root._read();
        wi.exported = exportValue(wi.root, <IDebugInfo>{ start: 0, end: wi.inputBuffer.byteLength }, [], eagerMode);
        //console.log('parse before return', performance.now() - start, 'date', Date.now());
        return wi.exported;
    },
    get: (path: string[]) => {
        var obj = wi.root;
        var parent: any = null;
        path.forEach(key => { parent = obj; obj = obj[key]; });

        var debug = <IDebugInfo>parent._debug['_m_' + path[path.length - 1]];
        wi.exported = exportValue(obj, debug, path, false); //
        return wi.exported;
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