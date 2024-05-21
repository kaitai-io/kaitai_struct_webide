import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import * as jsyaml from "js-yaml";
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
    const templateContent = await (await fetch("template_compiler/test.kcy.yaml")).text();
    const ksy = <KsySchema.IKsyFile>jsyaml.load(ksyContent, { schema: jsyaml.CORE_SCHEMA });
    const kcy = <ITemplateSchema>jsyaml.load(templateContent, { schema: jsyaml.CORE_SCHEMA });

    const compiledTemplate = TemplateCompiler.compileTemplateSchema(kcy);
    console.log("compiledTemplate", compiledTemplate);

    const ksyAny = <any>ksy;
    ksyAny.name = ksy.meta.id.ucFirst();
    const compiledCode = compiledTemplate.main(ksyAny);
    console.log("compiledCode", compiledCode);

    console.log("ksy", ksy);

    //const compilerKsy = cloneWithFilter(ksy, prop => !prop.startsWith("$"));
    //const compiler = KaitaiStructCompiler;
    //console.log(ksy);
    //console.log(compilerKsy);
    //const compiled = await compiler.compile("javascript", compilerKsy, null, false);
    //ksy.instancesByJsName
    //console.log(compiled);
}

run();
