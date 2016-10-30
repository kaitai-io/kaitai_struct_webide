// executes the given code and handles the result
application.setInterface({
    run: function (code, args, cb) {
        var result = { input: code, output: null, error: null };

        try {
            result.output = JSON.stringify(eval(code));
        } catch (e) {
            result.error = e.message;
        }

        cb(result);
    },
    reparse: function (cb) {
        io = new KaitaiStream(inputBuffer, 0);
        parsed = new module.exports(io);

        function clearMeta(obj) {
            if(typeof obj != "object") return;

            delete obj._io;
            delete obj._root;
            delete obj._parent;

            Object.keys(obj).forEach(key => clearMeta(obj[key]));
        }

        clearMeta(parsed);

        console.log(parsed);
        cb(parsed);
    }
});