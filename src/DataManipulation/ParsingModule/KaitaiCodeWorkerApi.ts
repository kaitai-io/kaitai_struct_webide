import {KaitaiCodeWorkerWrapper} from "./CodeExecution/KaitaiCodeWorkerWrapper";
import {WorkerFunctionStack} from "./CodeExecution/WorkerFunctionStack";

const codeExecutorWorker = new Worker( new URL('./CodeExecution/KaitaiCodeWorker.ts', import.meta.url), {type: "module"});
const workerFunctionStack = new WorkerFunctionStack();
export const KaitaiCodeWorkerApi = new KaitaiCodeWorkerWrapper(workerFunctionStack, codeExecutorWorker);