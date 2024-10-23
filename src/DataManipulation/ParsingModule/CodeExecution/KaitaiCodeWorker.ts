import {IWorkerMessage, IWorkerMessageParse} from "./WorkerMessages";
import {IWorkerResponse, ParseResultType} from "./WorkerResponses";
import KaitaiStream from "kaitai-struct/KaitaiStream";
import {EvaluatedClass, PARSE_SCRIPTS} from "./Types";

// @ts-ignore - It's required for evaluating module code, without this line, eval throws error:
// TypeError: KaitaiStream is undefined
self.KaitaiStream = KaitaiStream;


const evaluateCodeToCreateMainClass = (sourceCode: any, mainClassName: string): typeof EvaluatedClass => {
    let evaluatedMainClass: typeof EvaluatedClass = undefined;
    eval(`${sourceCode}
    evaluatedMainClass = ${mainClassName}.${mainClassName};`);
    return evaluatedMainClass;
};

const extractEnumsFromMainClass = (MainClass: typeof EvaluatedClass): any => {
    const enums = JSON.stringify({...MainClass});
    const mainClassName = MainClass.name;
    return {
        [mainClassName]: JSON.parse(enums)
    };
};

const parseObjectUsingMainClass = (MainClass: typeof EvaluatedClass, inputBuffer: ArrayBuffer) => {
    const ioInput = new KaitaiStream(inputBuffer, 0);
    let parseResult = new MainClass(ioInput);

    try {
        parseResult._read();
        return {root: parseResult};
    } catch (error) {
        return {
            root: parseResult,
            error: error
        };
    }
};


const parseScripts = (msg: IWorkerMessageParse) => {
    const MainClass = evaluateCodeToCreateMainClass(msg.sourceCode, msg.mainClass);
    const enums = extractEnumsFromMainClass(MainClass);
    const {root, error} = parseObjectUsingMainClass(MainClass, msg.inputBuffer);

    const response: IWorkerResponse = {
        type: PARSE_SCRIPTS,
        error: error,
        resultObject: root as unknown as ParseResultType,
        msgId: msg.msgId,
        eagerMode: msg.eagerMode,
        enums: enums
    };

    self.postMessage(response);
};

self.onmessage = (ev: MessageEvent) => {
    const msg = <IWorkerMessage>ev.data;
    switch (msg.type) {
        case PARSE_SCRIPTS: {
            parseScripts(msg as IWorkerMessageParse);
            return;
        }
        default:
            console.log("Unknown message", msg);
    }
};