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
});