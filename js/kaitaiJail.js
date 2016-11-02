function toExport(obj, name) {
    if (typeof obj != "object") return obj;

    var result = {};
    result._debug = obj._debug || {};
    result._debug.class = obj.constructor.name;
    var props = Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] != '_' && x != "constructor");
    console.log('keys', Object.keys(obj), 'props', props);
    Object.keys(obj).filter(x => x[0] != '_').forEach(key => result[key] = toExport(obj[key], name.concat(key)));
    props.forEach(key => {
        if (!('_props' in result))
            result._props = {};
        result._props[key] = name.concat(key);
    });
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
        io = new KaitaiStream(inputBuffer, 0);
        parseError = null;
        try {
            parsed = new module.exports(io);
            parsed._read();
        } catch (e) {
            parseError = e;
        }
        
        exported = toExport(parsed, []);
        console.log('[jail] parsed', parsed, 'exported', exported);
        cb(exported, parseError);
    },
    get: function (path, cb) {
        var obj = parsed;
        try {
            path.forEach(key => obj = obj[key]);
        } catch (e) {
            console.log(e);
            parseError = e;
        }
        cb(obj, parseError);
    }
});