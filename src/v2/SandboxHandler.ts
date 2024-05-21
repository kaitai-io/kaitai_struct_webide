interface IRpcRequest {
    messageId: string;
    method: string;
    arguments: any[];
    useWorker: boolean;
}

interface IRpcResponse {
    messageId: string;
    success: boolean;
    result?: any;
    error?: { asText: string, class: string, asJson: string };
}

class GenericSandboxError extends Error {
    constructor(public text: string, public errorClass: string, public value: any) {
        super(`${errorClass}: ${text}`);
    }
}

class ApiProxyPath {
    static fakeBaseObj = function(){ /* */ };

    constructor(public sandbox: SandboxHandler, public useWorker: boolean, public path: string[]) { }

    createProxy(): ApiProxyPath {
        return <ApiProxyPath><any>new Proxy(ApiProxyPath.fakeBaseObj, {
            get: (target, propName: string) => {
                if (propName === "then") return null;

                var path = Array.from(this.path);
                path.push(propName);
                return new ApiProxyPath(this.sandbox, this.useWorker, path).createProxy();
            },
            apply: (target, _this, args) => {
                return this.sandbox.workerCall(this.path.join("."), args, this.useWorker);
            }
        });
    }
}

export class SandboxHandler {
    msgHandlers: { [msgId: string]: (msg: IRpcResponse) => void } = {};
    lastMsgId = 0;
    iframe: HTMLIFrameElement;
    loadedPromise: Promise<void>;
    iframeOrigin: string;
    errorHandlers: { [errorClass: string]: new (text: string, value: any) => Error };

    constructor(public iframeSrc: string) {
        this.iframeOrigin = new URL(iframeSrc).origin;

        this.loadedPromise = new Promise<void>((resolve, reject) => {
            this.iframe = document.createElement("iframe");
            this.iframe.style.display = "none";
            this.iframe.onload = () => resolve();
            this.iframe.onerror = () => reject();
            this.iframe.src = iframeSrc;

            window.addEventListener("message", e => {
                if(e.source !== this.iframe.contentWindow) return;

                var msg = <IRpcResponse>e.data;
                if (this.msgHandlers[msg.messageId])
                    this.msgHandlers[msg.messageId](msg);
                delete this.msgHandlers[msg.messageId];
            });

            document.body.appendChild(this.iframe);
        });
    }

    async workerCall<T>(method: string, args: any[], useWorker: boolean = true) {
        await this.loadedPromise;

        return new Promise<T>((resolve, reject) => {
            let request = <IRpcRequest>{ method: method, arguments: args, messageId: `${++this.lastMsgId}`, useWorker: useWorker };

            this.msgHandlers[request.messageId] = response => {
                if (response.success)
                    resolve(response.result);
                else {
                    let error = response.error;
                    console.log("error", error);
                    let errorObj = JSON.parse(error.asJson);
                    if (error.class in this.errorHandlers)
                        reject(new this.errorHandlers[error.class](error.asText, errorObj));
                    else
                        reject(new GenericSandboxError(error.asText, error.class, errorObj));
                }

                //console.info(`[performance] [${(new Date()).format("H:i:s.u")}] Got worker response: ${Date.now()}.`);
            };

            this.iframe.contentWindow.postMessage(request, this.iframeOrigin);
        });
    }

    createProxy<T>(useWorker: boolean = true): T {
        return <T><any>new ApiProxyPath(this, useWorker, []).createProxy();
    }

    static create<T>(src: string, useWorker: boolean = true): T {
        var handler = new SandboxHandler(src);
        return handler.createProxy<T>(useWorker);
    }
}