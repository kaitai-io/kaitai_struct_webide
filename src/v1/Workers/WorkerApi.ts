import {KaitaiCodeWorkerWrapper} from "./CodeExecution/KaitaiCodeWorkerWrapper";
import {WorkerFunctionStack} from "./CodeExecution/WorkerFunctionStack";
import {IWorkerMessageInit} from "./CodeExecution/WorkerMessages";
import {INIT_WORKER_SCRIPTS} from "./CodeExecution/Types";

const codeExecutorWorker = new Worker(new URL("data-url:./CodeExecution/KaitaiCodeWorker.ts", import.meta.url));
const workerFunctionStack = new WorkerFunctionStack();
const workerWrapper = new KaitaiCodeWorkerWrapper(workerFunctionStack, codeExecutorWorker);

const initScriptsMessage: IWorkerMessageInit = {
    type: INIT_WORKER_SCRIPTS,
    scripts: {
        kaitaiStream: process.env.WORKER_LIB_KAITAI_STREAM_URL,
        zlib: process.env.WORKER_LIB_ZLIB_URL
    }
};
workerWrapper.sendMessageToWorker(initScriptsMessage);

export const codeExecutionWorkerApi: IWorkerApiMethods = {
    initCodeAction: workerWrapper.initCodeAction,
    setInputAction: workerWrapper.setInputAction,
    reparseAction: workerWrapper.reparseAction,
    getPropertyByPathAction: workerWrapper.getPropertyByPathAction
};