import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import { YAML } from "yamljs";

declare var kaitaiFsFiles: string[];

function cloneWithFilter(obj: any, filterFunc: (prop: string) => boolean): any {
    if (Array.isArray(obj))
        return obj.map(x => cloneWithFilter(x, filterFunc));
    else if (typeof obj === "object") {
        const result = {};
        for (const key of Object.keys(obj))
            if(filterFunc(key))
                result[key] = cloneWithFilter(obj[key], filterFunc);
        return result;
    }
    else
        return obj;
}

async function run(){
    const ksyContent = await (await fetch("template_compiler/test.ksy")).text();
    const ksy = <KsySchema.IKsyFile>YAML.parse(ksyContent, null, null, true);
    //const compilerKsy = cloneWithFilter(ksy, prop => !prop.startsWith("$"));
    //const compiler = new KaitaiStructCompiler();
    console.log(ksy);
    //console.log(compilerKsy);
    //const compiled = await compiler.compile("javascript", compilerKsy, null, false);
    //ksy.instancesByJsName
    //console.log(compiled);
}

run();
