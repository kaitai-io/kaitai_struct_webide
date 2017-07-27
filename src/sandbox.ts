import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import { YAML } from "yamljs";
import { TemplateCompiler, ITemplateSchema } from "./worker/TemplateCompiler";
import { ExpressionParser } from "./worker/ExpressionLanguage/ExpressionParser";

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

async function run() {
    let testCases = ["1+2*3", "4 + obj.method(1+2*3) * 2 || eof", "1+2+3+4"];
    testCases = ["this.instances"];
    for (const exprStr of testCases) {
        const expr = ExpressionParser.parse(exprStr);
        const js = TemplateCompiler.astToJs(expr);
        console.log(`"${exprStr}" -> ${expr.repr()}`, expr);
    }
    
    const ksyContent = await (await fetch("template_compiler/test.ksy")).text();
    const templateContent = await (await fetch("template_compiler/test.kcy")).text();
    const ksy = <KsySchema.IKsyFile>YAML.parse(ksyContent, null, null, true);
    const kcy = <ITemplateSchema>YAML.parse(templateContent);

    let templates = {};
    for (let name of Object.keys(kcy.templates)){ 
        const template = templates[name] = TemplateCompiler.compileTemplate(kcy.templates[name]);
        const jsCode = TemplateCompiler.templateNodeToJs2(template);
        console.log(`templates[${name}]\n${jsCode}`);
    }
    //console.log("templates", templates);

    //const compilerKsy = cloneWithFilter(ksy, prop => !prop.startsWith("$"));
    //const compiler = new KaitaiStructCompiler();
    //console.log(ksy);
    //console.log(compilerKsy);
    //const compiled = await compiler.compile("javascript", compilerKsy, null, false);
    //ksy.instancesByJsName
    //console.log(compiled);
}

run();
