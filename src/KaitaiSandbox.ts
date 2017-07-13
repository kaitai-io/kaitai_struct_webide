import { SandboxHandler } from "./SandboxHandler";
import { ISandboxMethods } from "./worker/WorkerShared";

export class ParseError extends Error {
    constructor(text: string, public value: { message: string, parsedLine: number, snippet: string }){ 
        super(`YAML parsing error in line ${value.parsedLine}: "${value.snippet}"`);
    }
}

export async function InitKaitaiSandbox() {
    var handler = new SandboxHandler("https://webide-usercontent.kaitai.io");
    handler.errorHandlers = { "ParseException": ParseError };

    var sandbox = handler.createProxy<ISandboxMethods>();
    await sandbox.loadScript(new URL("js/worker/worker/ImportLoader.js", location.href).href);
    await sandbox.loadScript(new URL("js/worker/worker/KaitaiWorkerV2.js", location.href).href);
    return sandbox;
}
