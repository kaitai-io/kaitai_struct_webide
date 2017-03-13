define(["require", "exports", "./app"], function (require, exports, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jail, TextDecoder, jailed;
    function jailrun(code, args, cb = null) {
        return exports.jailReady.then(() => {
            jail.remote.run(code, args, result => {
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
        return new Promise((resolve, reject) => jail._connection.importScript(app_1.baseUrl + fn, resolve, reject));
    }
    $(() => {
        jail = new jailed.Plugin(app_1.baseUrl + 'js/kaitaiJail.js');
        exports.jailReady = new Promise((resolve, reject) => {
            jail.whenConnected(() => resolve());
            jail.whenFailed(() => reject());
        });
        if (typeof TextDecoder !== "function")
            exports.jailReady = exports.jailReady.then(() => importScript('lib/text-encoding/encoding.js'));
        exports.jailReady = exports.jailReady.then(() => importScript('js/entities.js'));
        exports.jailReady = exports.jailReady.then(() => importScript('lib/kaitai_js_runtime/KaitaiStream.js'));
        exports.jailReady.then(() => { }, () => console.log('jail fail'));
    });
});
//# sourceMappingURL=app.jail.js.map