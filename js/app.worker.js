define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var worker = new Worker("js/kaitaiWorker.js");
    var msgHandlers = {};
    worker.onmessage = ev => {
        var msg = ev.data;
        msgHandlers[msg.msgId] && msgHandlers[msg.msgId](msg);
        delete msgHandlers[msg.msgId];
    };
    var lastMsgId = 0;
    function workerCall(request) {
        return new Promise((resolve, reject) => {
            request.msgId = ++lastMsgId;
            msgHandlers[request.msgId] = response => {
                if (response.error) {
                    console.log('error', response.error);
                    reject(response.error);
                }
                else
                    resolve(response.result);
            };
            worker.postMessage(request);
        });
    }
    exports.workerCall = workerCall;
    function workerEval(code) {
        return workerCall({ type: "eval", args: [code] });
    }
    exports.workerEval = workerEval;
});
//# sourceMappingURL=app.worker.js.map