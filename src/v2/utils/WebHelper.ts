export class WebHelper {
    static request(method: string, url: string, headers?: { [name: string]: string },
        responseType?: "arraybuffer", requestData?: Blob | ArrayBuffer): Promise<ArrayBuffer>;
    static request(method: string, url: string, headers?: { [name: string]: string },
        responseType?: XMLHttpRequestResponseType, requestData?: Blob | ArrayBuffer): Promise<any>;

    static request(method: string, url: string, headers?: { [name: string]: string },
        responseType?: XMLHttpRequestResponseType, requestData?: Blob | ArrayBuffer): Promise<any>
    {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            if (responseType)
                xhr.responseType = responseType;

            if (headers)
                for (var hdrName in headers)
                    if (headers.hasOwnProperty(hdrName))
                        xhr.setRequestHeader(hdrName, headers[hdrName]);

            xhr.onload = e => {
                if (200 <= xhr.status && xhr.status <= 299) {
                    var contentType = xhr.getResponseHeader("content-type");
                    if (contentType === "application/json" && !responseType)
                        resolve(JSON.parse(xhr.response));
                    else
                        resolve(xhr.response);
                }
                else
                    reject(xhr.response);
            };

            xhr.onerror = e => reject(e);
            xhr.send(requestData);
        });
    }
}