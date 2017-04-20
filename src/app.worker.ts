var worker = new Worker("js/kaitaiWorker.js");

var msgHandlers: { [msgId: number]: (msg: IWorkerMessage) => void } = {};

worker.onmessage = (ev: MessageEvent) => {
    var msg = <IWorkerMessage>ev.data;
    if (msgHandlers[msg.msgId])
        msgHandlers[msg.msgId](msg);
    delete msgHandlers[msg.msgId];
};

var lastMsgId = 0;
function workerCall(request: IWorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        request.msgId = ++lastMsgId;
        msgHandlers[request.msgId] = response => {
            if (response.error) {
                console.log("error", response.error);
                reject(response.error);
            }
            else
                resolve(response.result);

            //console.info(`[performance] [${(new Date()).format("H:i:s.u")}] Got worker response: ${Date.now()}.`);
        };
        worker.postMessage(request);
    });
}

export var workerMethods = {
    initCode: (sourceCode: string, mainClassName: string, ksyTypes: IKsyTypes) => {
        return workerCall({ type: "initCode", args: [sourceCode, mainClassName, ksyTypes] });
    },
    setInput: (inputBuffer: ArrayBuffer) => {
        return workerCall({ type: "setInput", args: [inputBuffer] });
    },
    reparse: (eagerMode: boolean) => {
        return <Promise<IExportedValue>>workerCall({ type: "reparse", args: [eagerMode] });
    },
    get: (path: string[]) => {
        return <Promise<IExportedValue>>workerCall({ type: "get", args: [path] });
    }
};