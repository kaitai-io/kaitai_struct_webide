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