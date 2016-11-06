var jail: any;
var jailReady, inputReady;
function jailrun(code, args?, cb = null) {
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

$(() => {
    jail = new jailed.Plugin(baseUrl + 'js/kaitaiJail.js');
    jailReady = new Promise((resolve, reject) => {
        jail.whenConnected(() => resolve());
        jail.whenFailed(() => reject());
    }).then(() => new Promise((resolve, reject) => jail._connection.importScript(baseUrl + 'lib/kaitai_js_runtime/KaitaiStream.js', resolve, reject)));
    jailReady.then(() => console.log('jail started'), () => console.log('jail fail'));
});