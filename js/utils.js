function downloadFile(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
        xhr.onload = function (e) {
            resolve(new Uint8Array(this.response));
        };
        xhr.send();
    });
}
class Delayed {
    constructor(delay) {
        this.delay = delay;
    }
    do(func) {
        if (this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(function () {
            this.timeout = null;
            func();
        }, this.delay);
    }
}
//# sourceMappingURL=utils.js.map