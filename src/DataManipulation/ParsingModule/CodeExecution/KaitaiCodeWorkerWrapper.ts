import {IExportedValue} from "../../ExportedValueTypes";
import {WorkerFunctionStack} from "./WorkerFunctionStack";
import {IWorkerMessage, IWorkerMessageGetInstance, IWorkerMessageParse} from "./WorkerMessages";
import {IWorkerResponse, IWorkerResponseGetInstance, IWorkerResponseParse} from "./WorkerResponses";
import {GET_INSTANCE, IWorkerApiMethods, IWorkerParsedResponse, PARSE_SCRIPTS} from "./Types";
import {CompilationTarget} from "../../CompilationModule/CompilerService";

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

    parseAction = (eagerMode: boolean): Promise<IWorkerParsedResponse> => {
        return new Promise<IWorkerParsedResponse>((resolve, reject) => {
            const digestResponseFromWorkerFn = (response: IWorkerResponseParse) => this.digestParseResponseFromWorker(response, resolve, reject);
            const msgId = this.stack.pushFunctionToStack(digestResponseFromWorkerFn);
            const message = this.prepareIWorkerMessageParse(msgId, eagerMode);
            this.sendMessageToWorker(message);
        });
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
        console.log("[KaitaiCodeWorkerWrapper][REQUEST]", message);
        this.worker.postMessage(message);
    };

    onMessageReceive = (ev: MessageEvent): void => {
        const msg = <IWorkerResponse>ev.data;
        switch (msg.type) {
            case GET_INSTANCE: {
                this.onMessageReceiveParse(msg)
                return;
            }
            case PARSE_SCRIPTS: {
                this.onMessageReceiveParse(msg as IWorkerResponseParse);
                return;
            }
        }
    };

    private onMessageReceiveParse = (msg: IWorkerResponse) => {
        console.log("[KaitaiCodeWorkerWrapper][RESPONSE]", msg);
        const parseResponsePromise = this.stack.removeFunctionFromStack(msg.msgId);
        if (!!parseResponsePromise) {
            parseResponsePromise(msg);
        }
    };


    private digestParseResponseFromWorker = (response: IWorkerResponseParse,
                                        resolve: (value?: (PromiseLike<IWorkerParsedResponse> | IWorkerParsedResponse)) => void,
                                        reject: (reason?: any) => void) => {
        let {error, resultObject, flatExported} = response;
        resolve({resultObject, flatExported, error});
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