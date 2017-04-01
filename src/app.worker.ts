var worker = new Worker("js/kaitaiWorker.js");

var msgHandlers: { [msgId: number]: (msg: IWorkerMessage) => void } = {};

worker.onmessage = ev => {
    var msg = <IWorkerMessage>ev.data;
    msgHandlers[msg.msgId] && msgHandlers[msg.msgId](msg);
    delete msgHandlers[msg.msgId];
};

var lastMsgId = 0;
export function workerCall(request: IWorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        request.msgId = ++lastMsgId;
        msgHandlers[request.msgId] = response => {
            if (response.error) {
                console.log('error', response.error);
                reject(response.error);
            }
            else
                resolve(response.result);

            //console.info(`[performance] [${(new Date()).format('H:i:s.u')}] Got worker response: ${Date.now()}.`);
        };
        worker.postMessage(request);
    });
}

export function workerEval(code: string) {
    return workerCall({ type: "eval", args: [code] });
}