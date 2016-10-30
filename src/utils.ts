function downloadFile(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    return new Promise<Uint8Array>((resolve, reject) => {
        xhr.onload = function (e) {
            resolve(new Uint8Array(this.response));
        };

        xhr.send();
    });
}

class Delayed {
    private timeout: number;

    constructor(public delay: number) { }

    public do(func) {
        if (this.timeout)
            clearTimeout(this.timeout);

        this.timeout = setTimeout(function () {
            this.timeout = null;
            func();
        }, this.delay);
    }
}