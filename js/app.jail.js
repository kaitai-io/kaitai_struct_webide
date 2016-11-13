var jail, TextDecoder;
var jailReady, inputReady;
function jailrun(code, args, cb = null) {
    return jailReady.then(() => {
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
function importScript(fn) {
    return new Promise((resolve, reject) => jail._connection.importScript(baseUrl + fn, resolve, reject));
}
$(() => {
    jail = new jailed.Plugin(baseUrl + 'js/kaitaiJail.js');
    jailReady = new Promise((resolve, reject) => {
        jail.whenConnected(() => resolve());
        jail.whenFailed(() => reject());
    });
    if (typeof TextDecoder !== "function")
        jailReady = jailReady.then(() => importScript('lib/text-encoding/encoding.js'));
    jailReady = jailReady.then(() => importScript('js/entities.js'));
    jailReady = jailReady.then(() => importScript('lib/kaitai_js_runtime/KaitaiStream.js'));
    jailReady.then(() => { }, () => console.log('jail fail'));
});
//# sourceMappingURL=app.jail.js.map