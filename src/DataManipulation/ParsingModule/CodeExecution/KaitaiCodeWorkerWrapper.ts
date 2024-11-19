import {IExportedValue} from "../../ExportedValueTypes";
import {WorkerFunctionStack} from "./WorkerFunctionStack";
import {IWorkerMessage, IWorkerMessageGetInstance, IWorkerMessageParse} from "./WorkerMessages";
import {IWorkerResponse, IWorkerResponseGetInstance, IWorkerResponseParse} from "./WorkerResponses";
import {GET_INSTANCE, IWorkerApiMethods, PARSE_SCRIPTS} from "./Types";
import {CompilationTarget} from "../../CompilationModule/CompilerService";
import {useErrorStore} from "../../../Stores/ErrorStore";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";

export class KaitaiCodeWorkerWrapper implements IWorkerApiMethods {
    stack: WorkerFunctionStack;
    worker: Worker;

    inputBuffer: ArrayBuffer;
    compilationTarget: CompilationTarget;

    constructor(stack: WorkerFunctionStack, worker: Worker) {
        this.stack = stack;
        this.worker = worker;
        worker.onmessage = this.onMessageReceive.bind(this);
    }

    setCompilationTarget = (compilationTarget: CompilationTarget): void => {
        this.compilationTarget = compilationTarget;
    };

    setInputAction = (inputBuffer: ArrayBuffer): void => {
        this.inputBuffer = inputBuffer;
    };

    parseAction = (eagerMode: boolean): void => {
        const message = this.prepareIWorkerMessageParse(this.stack.getNewMessageId(), eagerMode);
        this.sendMessageToWorker(message);
    };

    getPropertyByPathAction = (path: string[]): Promise<IExportedValue> => {
        return new Promise<IExportedValue>((resolve, reject) => {
            const digestResponseFromWorkerFn = (response: IWorkerResponseGetInstance) => this.digestGetInstanceResponseFromWorker(response, resolve, reject);
            const msgId = this.stack.pushFunctionToStack(digestResponseFromWorkerFn);
            const message: IWorkerMessageGetInstance = {
                type: GET_INSTANCE,
                msgId: msgId,
                path: path
            };
            this.sendMessageToWorker(message);
        });
    };

    sendMessageToWorker = (message: IWorkerMessage): void => {
        console.log(`[KaitaiCodeWorkerWrapper][REQUEST][${message.type}]`, message);
        this.worker.postMessage(message);
    };

    onMessageReceive = (ev: MessageEvent): void => {
        const message = <IWorkerResponse>ev.data;
        console.log(`[KaitaiCodeWorkerWrapper][RESPONSE][${message.type}]`, message);
        switch (message.type) {
            case GET_INSTANCE: {
                this.onMessageReceiveGetInstance(message);
                return;
            }
            case PARSE_SCRIPTS: {
                this.onMessageReceiveParse(message);
                return;
            }
        }
    };

    private onMessageReceiveGetInstance = (msg: IWorkerResponseGetInstance) => {
        const getInstanceDigestFn = this.stack.removeFunctionFromStack(msg.msgId);
        if (!!getInstanceDigestFn) {
            getInstanceDigestFn(msg);
        }
    };
    private onMessageReceiveParse = (msg: IWorkerResponseParse) => {
        const store = useCurrentBinaryFileStore();
        let {error, resultObject, flatExported} = msg;
        if (error) {
            useErrorStore().setError(error);
        } else {
            useErrorStore().clearErrors();
        }
        store.updateParsedFile(resultObject, flatExported);
    };


    private digestGetInstanceResponseFromWorker = (response: IWorkerResponseGetInstance,
                                                   resolve: (value?: (PromiseLike<IExportedValue> | IExportedValue)) => void,
                                                   reject: (reason?: any) => void) => {
        const {instance} = response;
        resolve(instance);
    };

    prepareIWorkerMessageParse = (msgId: number, eagerMode: boolean): IWorkerMessageParse => {
        return {
            type: PARSE_SCRIPTS,
            msgId: msgId,
            eagerMode: eagerMode,
            inputBuffer: this.inputBuffer,
            compilationTarget: this.compilationTarget
        };
    };

}