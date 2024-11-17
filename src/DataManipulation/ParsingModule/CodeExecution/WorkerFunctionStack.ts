import {IWorkerResponse} from "./WorkerResponses";

export class WorkerFunctionStack {
    msgHandlers: { [msgId: number]: (msg: IWorkerResponse) => void } = {};
    lastMsgId = 0;

    pushFunctionToStack(parseResponseFromWorker: (response: IWorkerResponse) => void): number {
        const msgId = ++this.lastMsgId;
        this.msgHandlers[msgId] = parseResponseFromWorker;
        return msgId;
    }

    removeFunctionFromStack(msgId: number) {
        if (!this.msgHandlers[msgId]) {
            return null;
        }
        const parseResponseMethod = this.msgHandlers[msgId];
        delete this.msgHandlers[msgId];
        return parseResponseMethod;
    }
}