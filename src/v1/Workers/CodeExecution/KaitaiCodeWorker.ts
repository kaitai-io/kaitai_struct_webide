declare function importScripts(...urls: string[]): void;

const myself = <Worker><any>self;

const evaluateCodeToCreateMainClass = (sourceCode: string, mainClassName: string) => {
    let evaluatedMainClass = undefined;
    eval(`${sourceCode}
    evaluatedMainClass = ${mainClassName}.${mainClassName};`);
    return evaluatedMainClass;
};

const extractEnumsFromMainClass = (MainClass): any => {
    const enums = JSON.stringify({...MainClass});
    const mainClassName = MainClass.name;
    return {
        [mainClassName]: JSON.parse(enums)
    };
};

const parseObjectUsingMainClass = (MainClass, inputBuffer) => {
    const ioInput = new KaitaiStream(inputBuffer, 0);
    let parseResult = new MainClass(ioInput);

    try {
        parseResult._read();
        return {root: parseResult};
    } catch (error: Error) {
        return {
            root: parseResult,
            error: error
        };
    }
};

const INIT_WORKER_SCRIPTS = "INIT_WORKER_SCRIPTS";
const PARSE_SCRIPTS = "PARSE_SCRIPTS";


let scriptsInitialized = false;
const initWorkerScripts = ({scripts}: IWorkerMessageInit) => {
    if (scriptsInitialized) return;
    console.log("Initializing scripts for worker", scripts);

    importScripts(scripts.kaitaiStream);
    (KaitaiStream as any).depUrls = (KaitaiStream as any).depUrls || {};
    (KaitaiStream as any).depUrls.zlib = scripts.zlib;
    scriptsInitialized = true;

    myself.postMessage({
        type: INIT_WORKER_SCRIPTS
    });
};

const parseScripts = (msg: IWorkerMessageParse) => {
    const MainClass = evaluateCodeToCreateMainClass(msg.sourceCode, msg.mainClass);
    const enums = extractEnumsFromMainClass(MainClass);
    const {root, error} = parseObjectUsingMainClass(MainClass, msg.inputBuffer);

    const response: IWorkerResponse = {
        type: PARSE_SCRIPTS,
        error: error,
        resultObject: root,
        msgId: msg.msgId,
        eagerMode: msg.eagerMode,
        enums: enums
    };

    myself.postMessage(response);
};

myself.onmessage = (ev: MessageEvent) => {
    const msg = <IWorkerMessage>ev.data;
    switch (msg.type) {
        case INIT_WORKER_SCRIPTS: {
            initWorkerScripts(msg as IWorkerMessageInit);
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