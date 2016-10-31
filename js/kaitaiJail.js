// executes the given code and handles the result
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
        

        function prepareForExport(obj) {
            if(typeof obj != "object") return;

            delete obj._io;
            delete obj._root;
            delete obj._parent;
            if (obj._debug)
                obj._debug.class = obj.constructor.name;

            Object.keys(obj).forEach(key => prepareForExport(obj[key]));
        }

        console.log('parsed in jail', parsed);

        prepareForExport(parsed);
        cb(parsed, parseError);
    }
});