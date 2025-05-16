import {IWorkerMessage, IWorkerMessageGetInstance, IWorkerMessageParse} from "./WorkerMessages";
import {IWorkerResponse, IWorkerResponseGetInstance} from "./WorkerResponses";
import {EvaluatedClass, GET_INSTANCE, PARSE_SCRIPTS} from "./Types";
import {EvaluatedCodeScope} from "./EvaluatedCodeScope";
import {fetchInstance, mapObjectToExportedValue} from "../../ExportedValueMappers/ObjectToIExportedValueMapper";
import {ExportedValueMappers} from "../../ExportedValueMappers";

let evaluatedScope: EvaluatedCodeScope = undefined;
let root: EvaluatedClass = undefined;

const getInstanceByPath = (msg: IWorkerMessageGetInstance) => {
    let parent = root;
    const path = [...msg.path];
    const instanceName= path.pop()
    path.forEach(pathPart => parent = parent[pathPart]);

    const response: IWorkerResponseGetInstance = {
        type: GET_INSTANCE,
        msgId: msg.msgId,
        instance: fetchInstance(parent, instanceName, path, false, evaluatedScope)
    };

    self.postMessage(response);
}
const parseScripts = (msg: IWorkerMessageParse) => {
    evaluatedScope = new EvaluatedCodeScope();
    const {error: evaluationError} = evaluatedScope.evaluateCode(msg.compilationTarget);
    const {parsed, error: parsingError} = evaluatedScope.parseBuffer(msg.inputBuffer);
    root = parsed;

    const exported = mapObjectToExportedValue(parsed, {
        scope: evaluatedScope,
        incomplete: !!parsingError,
        streamLength: msg.inputBuffer.byteLength,
        eagerMode: msg.eagerMode,
    });

    const flattenedExported = ExportedValueMappers.flatten(exported);


    const response: IWorkerResponse = {
        type: PARSE_SCRIPTS,
        error: evaluationError || parsingError,
        resultObject: exported,
        flatExported: flattenedExported,
        msgId: msg.msgId,
    };

    self.postMessage(response);
};

self.onmessage = (ev: MessageEvent) => {
    const msg = <IWorkerMessage>ev.data;
    switch (msg.type) {
        case GET_INSTANCE: {
            getInstanceByPath(msg as IWorkerMessageGetInstance);
            return;
        }
        case PARSE_SCRIPTS: {
            parseScripts(msg as IWorkerMessageParse);
            return;
        }
        default:
            console.log("Unknown message", msg);
    }
};