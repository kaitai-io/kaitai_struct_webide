define(["require", "exports", "./app", "jailed"], function (require, exports, app_1, jailed) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextDecoder;
    function jailrun(code, args, cb = null) {
        return exports.jailReady.then(() => {
            exports.jail.remote.run(code, args, result => {
                if (cb)
                    cb(result);
                else if (result.error)
                    console.log(`Error: ${result.error}`);
                else if (result.output)
                    console.log("Result =", JSON.parse(result.output));
            });
        });
    }
    exports.jailrun = jailrun;
    function importScript(fn) {
        return new Promise((resolve, reject) => exports.jail._connection.importScript(app_1.baseUrl + fn, resolve, reject));
    }
    $(() => {
        exports.jail = new jailed.Plugin(app_1.baseUrl + 'js/kaitaiJail.js');
        exports.jailReady = new Promise((resolve, reject) => {
            exports.jail.whenConnected(() => resolve());
            exports.jail.whenFailed(() => reject());
        });
        if (typeof TextDecoder !== "function")
            exports.jailReady = exports.jailReady.then(() => importScript('lib/text-encoding/encoding.js'));
        exports.jailReady = exports.jailReady.then(() => importScript('js/entities.js'));
        exports.jailReady = exports.jailReady.then(() => importScript('lib/kaitai_js_runtime/KaitaiStream.js'));
        exports.jailReady.then(() => { }, () => console.log('jail fail'));
    });
});
//# sourceMappingURL=app.jail.js.map