var application, ioInput, parsed, parseError, KaitaiStream, exported, module, inputBuffer;
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
function exportValue(obj, debug, path, noLazy) {
    //if (!debug) debugger;
    var result = { start: debug && debug.start, end: debug && debug.end, path: path, type: getObjectType(obj) };
    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined)
        result.primitiveValue = obj;
    else if (result.type === ObjectType.Array)
        result.arrayItems = obj.map((item, i) => exportValue(item, debug && debug.arr[i], path.concat(i.toString()), noLazy));
    else if (result.type === ObjectType.Object) {
        result.object = { class: obj.constructor.name, propPaths: {}, fields: {} };
        Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== '_' && x !== "constructor").forEach(propName => {
            result.object.propPaths[propName] = path.concat(propName);
            if (noLazy) {
                console.log('noLazy', propName, obj[propName]);
                result.object.fields[propName] = exportValue(obj[propName], obj._debug[propName], path.concat(propName), noLazy);
            }
        });
        Object.keys(obj).filter(x => x[0] !== '_').forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug[key], path.concat(key), noLazy));
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
            parsed = new module.exports(ioInput);
            parsed._read();
        }
        catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }
        exported = exportValue(parsed, { start: 0, end: inputBuffer.byteLength }, [], noLazy);
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
        }
        catch (e) {
            parseError = { message: e.message, stack: e.stack };
        }
        exported = exportValue(obj, parent._debug['_m_' + path[path.length - 1]], path);
        //console.log('get original =', obj, ', exported =', exported);
        cb(exported, parseError);
    }
});
//# sourceMappingURL=kaitaiJail.js.map