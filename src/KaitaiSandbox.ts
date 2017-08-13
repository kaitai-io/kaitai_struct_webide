import { SandboxHandler } from "./SandboxHandler";
import { ISandboxMethods } from "./worker/WorkerShared";

export class ParseError extends Error {
    constructor(text: string, public value: { message: string, parsedLine: number, snippet: string }) {
        super(`YAML parsing error in line ${value.parsedLine}: "${value.snippet}"`);
    }
}

export async function InitKaitaiSandbox() {
    const handler = new SandboxHandler("https://webide-usercontent.kaitai.io");
    handler.errorHandlers = { "ParseException": ParseError };

    const sandbox = handler.createProxy<ISandboxMethods>();
    const npmDir = "lib/_npm";
    await sandbox.loadScript(new URL("js/AmdLoader.js", location.href).href);
    await sandbox.eval(`
        loader.projectBase = "${window.location.href}";
        loader.paths = {
            "yamljs": "${npmDir}/yamljs/yaml",
            "KaitaiStream": "${npmDir}/kaitai-struct/KaitaiStream",
            "kaitai-struct-compiler": "${npmDir}/kaitai-struct-compiler/kaitai-struct-compiler"
        }`);
    await sandbox.loadScript(new URL("js/extensions.js", location.href).href);
    await sandbox.loadScript(new URL("js/worker/worker/KaitaiWorkerV2.js", location.href).href);
    return sandbox;
}

export async function InitKaitaiWithoutSandbox() {
    window["api"] = {};
    await loader.require(["/worker/KaitaiWorkerV2"]);
    return window["api"];
}
