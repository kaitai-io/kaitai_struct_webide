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
    error?: any;
}

export class SandboxHandler {
    msgHandlers: { [msgId: string]: (msg: IRpcResponse) => void } = {};
    lastMsgId = 0;
    iframe: HTMLIFrameElement;
    loadedPromise: Promise<void>;
    iframeOrigin: string;

    constructor(public iframeSrc: string) {
        this.iframeOrigin = new URL(iframeSrc).origin;

        this.loadedPromise = new Promise<void>((resolve, reject) => {
            this.iframe = document.createElement("iframe");
            this.iframe.style.display = 'none';
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
                else
                {
                    console.log("error", response.error);
                    reject(response.error);
                }

                //console.info(`[performance] [${(new Date()).format("H:i:s.u")}] Got worker response: ${Date.now()}.`);
            };

            this.iframe.contentWindow.postMessage(request, this.iframeOrigin);
        });
    }

    createProxy<T>(useWorker: boolean = true): T {
        return <T><any>new Proxy(this, {
            get: (target, methodName: string) => (...args: any[]) => this.workerCall(methodName, args, useWorker)
        });
    }

    static create<T>(src: string, useWorker: boolean = true): T {
        var handler = new SandboxHandler(src);
        return handler.createProxy<T>(useWorker);
    }
}