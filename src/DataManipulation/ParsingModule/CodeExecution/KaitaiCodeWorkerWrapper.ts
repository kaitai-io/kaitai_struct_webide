import {fetchInstance, IParsingOptions, mapObjectToExportedValue} from "../../ExportedValueMappers/ObjectToIExportedValueMapper";
import {IExportedValue} from "../../ExportedValueTypes";
import {WorkerFunctionStack} from "./WorkerFunctionStack";
import {IWorkerMessage, IWorkerMessageParse} from "./WorkerMessages";
import {IWorkerResponse, IWorkerResponseParse, ParseResultObject, ParseResultType} from "./WorkerResponses";
import {IKsyTypes, IWorkerApiMethods, IWorkerParsedResponse, PARSE_SCRIPTS} from "./Types";

export class KaitaiCodeWorkerWrapper implements IWorkerApiMethods {
    stack: WorkerFunctionStack;
    worker: Worker;
    mainClass: string;
    sourceCode: string;
    ksyTypes: IKsyTypes;
    inputBuffer: ArrayBuffer;
    root: ParseResultType;
    exported: IExportedValue;

    constructor(stack: WorkerFunctionStack, worker: Worker) {
        this.stack = stack;
        this.worker = worker;
        worker.onmessage = this.onMessageReceive.bind(this);
    }

    setOnlyCodeAction = (sourceCode: string): void => {
        this.sourceCode = sourceCode;
    }

    setCodeAction = (sourceCode: string, mainClassName: string, ksyTypes: IKsyTypes): void => {
        this.sourceCode = sourceCode;
        this.mainClass = mainClassName;
        this.ksyTypes = {...ksyTypes};
    }

    setInputAction = (inputBuffer: ArrayBuffer): void => {
        this.inputBuffer = inputBuffer;
    }

    parseAction = (eagerMode: boolean): Promise<IWorkerParsedResponse> => {
        return new Promise<IWorkerParsedResponse>((resolve, reject) => {
            const digestResponseFromWorkerFn = (response: IWorkerResponseParse) => this.digestResponseFromWorker(response, resolve, reject);
            const msgId = this.stack.pushFunctionToStack(digestResponseFromWorkerFn);
            const message = this.prepareIWorkerMessageParse(msgId, eagerMode);
            this.sendMessageToWorker(message);
        });
    }

    getPropertyByPathAction = (path: string[]): Promise<IExportedValue> => {
        let parent = this.root as ParseResultObject;
        const parentPath = path.slice(0, -1);
        parentPath.forEach(key => parent = parent[key] as ParseResultObject);
        const propName = path[path.length - 1];
        const property = fetchInstance(parent, propName, parentPath, false);
        return Promise.resolve(property);
    }

    sendMessageToWorker = (message: IWorkerMessage): void => {
        console.log("[KaitaiCodeWorkerWrapper][REQUEST]", message);
        this.worker.postMessage(message);
    }

    onMessageReceive = (ev: MessageEvent): void => {
        const msg = <IWorkerResponse>ev.data;
        switch (msg.type) {
            case PARSE_SCRIPTS: {
                this.onMessageReceiveParse(msg as IWorkerResponseParse);
                return;
            }
        }
    }

    private onMessageReceiveParse = (msg: IWorkerResponseParse) => {
        console.log("[KaitaiCodeWorkerWrapper][RESPONSE]", msg);
        const parseResponsePromise = this.stack.removeFunctionFromStack(msg.msgId);
        if (!!parseResponsePromise) {
            parseResponsePromise(msg);
        }
    }


    private digestResponseFromWorker = (response: IWorkerResponseParse,
                                     resolve: (value?: (PromiseLike<IWorkerParsedResponse> | IWorkerParsedResponse)) => void,
                                     reject: (reason?: any) => void) => {
        let {error, resultObject, eagerMode, enums} = response;

        const parsingOptions = this.prepareParsingOptions(eagerMode, enums, error);
        this.root = {...resultObject as ParseResultObject};
        this.exported = mapObjectToExportedValue(resultObject, parsingOptions);

        if (error) {
            console.log("[KaitaiCodeWorkerWrapper] Error: ", error);
        }

        if (error && (this.exported === undefined || this.exported === null)) {
            reject(error);
        } else {
            resolve({resultObject: this.exported, error});
        }
    }

    prepareIWorkerMessageParse = (msgId: number, eagerMode: boolean): IWorkerMessageParse => {
        return {
            type: PARSE_SCRIPTS,
            msgId: msgId,
            eagerMode: eagerMode,
            sourceCode: this.sourceCode,
            mainClass: this.mainClass,
            ksyTypes: this.ksyTypes,
            inputBuffer: this.inputBuffer,
        };
    }

    prepareParsingOptions = (eagerMode: boolean, enums: any, error: Error): IParsingOptions => {
        return {
            eagerMode: eagerMode,
            ksyTypes: this.ksyTypes,
            enums: enums,
            incomplete: !!error,
            streamLength: this.inputBuffer.byteLength,
        };
    }

}