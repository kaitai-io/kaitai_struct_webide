var application, ioInput, root, parseError, KaitaiStream, exported, module, inputBuffer;
class IDebugInfo {
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
function exportValue(obj, debug, path, noLazy, ioOffset) {
    //if (!debug) debugger;
    var result = { start: debug && debug.start, end: debug && debug.end, ioOffset: ioOffset, path: path, type: getObjectType(obj) };
    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined) {
        result.primitiveValue = obj;
        if (debug && debug.enumName) {
            result.enumName = debug.enumName;
            var enumObj = module.exports;
            debug.enumName.split('.').slice(1).forEach(p => enumObj = enumObj[p]);
            var flagCheck = 0, flagSuccess = true;
            var flagStr = Object.keys(enumObj).filter(x => isNaN(x)).filter(x => {
                if (flagCheck & enumObj[x]) {
                    flagSuccess = false;
                    return false;
                }
                flagCheck |= enumObj[x];
                return obj & enumObj[x];
            }).join("|");
            result.enumStringValue = enumObj[obj] || (flagSuccess && flagStr);
        }
    }
    else if (result.type === ObjectType.Array)
        result.arrayItems = obj.map((item, i) => exportValue(item, debug && debug.arr[i], path.concat(i.toString()), noLazy, ioOffset));
    else if (result.type === ObjectType.Object) {
        var childIoOffset = obj._io._byteOffset;
        if (result.start === childIoOffset) {
            //console.log('m', path.join('/'), result.ioOffset, childIoOffset);
            result.ioOffset = childIoOffset;
            result.start = 0;
        }
        result.object = { class: obj.constructor.name, instances: {}, fields: {} };
        var ksyType = ksyTypes[result.object.class];
        Object.keys(obj).filter(x => x[0] !== '_').forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug[key], path.concat(key), noLazy, childIoOffset));
        Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== '_' && x !== "constructor").forEach(propName => {
            var ksyInstanceData = ksyType && ksyType.instances[propName];
            var eagerLoad = ksyInstanceData && ksyInstanceData["-webide-parse-mode"] === "eager";
            if (eagerLoad || noLazy)
                result.object.fields[propName] = exportValue(obj[propName], obj._debug['_m_' + propName], path.concat(propName), noLazy, childIoOffset);
            else
                result.object.instances[propName] = { path: path.concat(propName), offset: 0 };
        });
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
        }
        catch (e) {
            console.log(e);
            result.error = e.message;
        }
        cb(result);
    },
    reparse: function (cb, noLazy) {
        ioInput = new KaitaiStream(inputBuffer, 0);
        parseError = null;
        try {
            root = new module.exports(ioInput);
            root._read();
        }
        catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }
        exported = exportValue(root, { start: 0, end: inputBuffer.byteLength }, [], noLazy, 0);
        //console.log('[jail] root', root, 'exported', exported);
        cb(exported, parseError);
    },
    get: function (path, cb) {
        var obj = root;
        var parent = null;
        try {
            path.forEach(key => {
                parent = obj;
                obj = obj[key];
            });
        }
        catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }
        exported = exportValue(obj, parent._debug['_m_' + path[path.length - 1]], path, false, parent._io && parent._io._byteOffset);
        //console.log('jail get', path.join('/'), exported.ioOffset, exported.start, exported.end);
        //console.log('get original =', obj, ', exported =', exported);
        cb(exported, parseError);
    }
});
//# sourceMappingURL=kaitaiJail.js.map