var application: any, ioInput: any, parsed: any, parseError: any, KaitaiStream: any, exported: any, module: any, inputBuffer: any;

class IDebugInfo {
    start: number;
    end: number;
    arr?: IDebugInfo[];
}

function isUndef(obj) { return typeof obj === "undefined"; }

function getObjectType(obj) {
    if (obj instanceof Uint8Array)
        return ObjectType.TypedArray;
    else if (typeof obj !== "object")
        return isUndef(obj) ? ObjectType.Undefined : ObjectType.Primitive;
    else if (Array.isArray(obj))
        return ObjectType.Array;
    else
        return ObjectType.Object;
}

function exportValue(obj, debug: IDebugInfo, path: string[]): IExportedValue {
    if (!debug) debugger;
    var result = <IExportedValue>{ start: debug.start, end: debug.end, path: path, type: getObjectType(obj) };

    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || obj.type === ObjectType.Undefined)
        result.primitiveValue = obj;
    else if (result.type === ObjectType.Array)
        result.arrayItems = obj.map((item, i) => exportValue(item, debug.arr[i], path.concat(i.toString())));
    else if (result.type === ObjectType.Object) {
        result.object = { class: obj.constructor.name, propPaths: {}, fields: {} };
        Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== '_' && x !== "constructor").forEach(propName => result.object.propPaths[propName] = path.concat(propName));
        Object.keys(obj).filter(x => x[0] !== '_').forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug[key], path.concat(key)));
    }
    else
        console.log(`Unknown object type: ${result.type}`);

    return result;
}

application.setInterface({
    run: function (code, args, cb) {
        var result = { input: code, output: null, error: null };

        try {
            result.output = JSON.stringify(eval(code));
        } catch (e) {
            console.log(e);
            result.error = e.message;
        }

        cb(result);
    },
    reparse: function (cb) {
        ioInput = new KaitaiStream(inputBuffer, 0);
        parseError = null;
        try {
            parsed = new module.exports(ioInput);
            parsed._read();
        } catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }

        exported = exportValue(parsed, <IDebugInfo>{ start: 0, end: inputBuffer.byteLength }, []);
        //console.log('[jail] parsed', parsed, 'exported', exported);
        cb(exported, parseError);
    },
    get: function (path, cb) {
        var obj = parsed;
        var parent = null;
        try {
            path.forEach(key => {
                parent = obj;
                obj = obj[key];
            });
        } catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }

        exported = exportValue(obj, <IDebugInfo>parent._debug['_m_' + path[path.length - 1]], path);
        //console.log('get original =', obj, ', exported =', exported);
        cb(exported, parseError);
    }
});