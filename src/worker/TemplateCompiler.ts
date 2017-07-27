export interface ITemplateSchema {
    templates: { [name: string]: string };
}

class TemplateNode {
    children: TemplateNode[] = [];

    constructor(public value: TemplatePart, public parent: TemplateNode){ }

    repr(): string {
        let result = this.value ? this.value.repr() + "\n" : "";
        for (const item of this.children)
            result += item.repr().split("\n").map((x,i) => (i == 0 ? '- ': '  ') + x).join("\n") + "\n";
        result = result.substring(0, result.length - 1);
        return result;
    }
}

class TemplatePart {
    type: "text"|"template"|"for"|"if"|"closeNode";

    textValue: string;
    for: { item: string, expr: string };
    if: { expr: string };
    closeNode: { tag: string };
    template: { expr: string, formatter: string };

    constructor(public value: string, isText: boolean) {
        let match;
        if(isText) {
            this.type = "text";
            this.textValue = value;
        }
        else if (match = /for ([a-zA-Z]+) in (.*)/.exec(value)) {
            this.type = "for";
            this.for = { item: match[1], expr: match[2] };
        } else if (match = /if (.*)/.exec(value)) {
            this.type = "if";
            this.if = { expr: match[1] };
        } else if (match = /\/(for|if)/.exec(value)) {
            this.type = "closeNode";
            this.closeNode = { tag: match[1] };
        } else if (match = /(.*)(?:\|(.*))?$/.exec(value)) {
            this.type = "template";
            this.template = { expr: match[1], formatter: match[2] };
        }
    }

    repr() {
        return `${this.type}: "${this.value.replace(/\n/g, "\\n")}"`;
    }
}

export class TemplateCompiler {
    static templateListToTree(parts: TemplatePart[]) {
        const root = new TemplateNode(null, null);

        let current = root;

        for (let part of parts) {
            //console.log(part.type, part.for || part.if || part.template || part.closeNode);
            if (part.type === "closeNode") {
                if (current.value.type !== part.closeNode.tag)
                    throw new Error(`Invalid close tag! Expected ${current.value.type}, got ${part.closeNode.tag}!`);

                current = current.parent;
            } else {
                const newNode = new TemplateNode(part, current);
                current.children.push(newNode);
                if (part.type === "for" || part.type === "if")
                    current = newNode;
            }
        }

        return root;
    }

    static compileTemplate(template: string) {
        const parts = template.split(/\{\{(.*?)\}\}/).map((x,i) => new TemplatePart(x, i % 2 == 0));
        const exprs = parts.map(x => x.for && x.for.expr || x.if && x.if.expr || x.template && x.template.expr).filter(x => x);
        console.log("exprs", exprs);
        //for (let part of parts)
        //    console.log(part.type, part.for || part.if || part.template || part.closeNode);
        
        const rootNode = this.templateListToTree(parts);
        console.log(rootNode.repr());
        return rootNode;
    }

    async compile(templateSchema: ITemplateSchema, compilerSchema: KsySchema.IKsyFile, jsImporter: IYamlImporter, isDebug: boolean): Promise<{ [filename: string]: string; }> {
        console.log("TemplateCompiler", templateSchema, compilerSchema);
        for (let tpl of Object.values(templateSchema.templates)) {
            const rootNode = TemplateCompiler.compileTemplate(tpl);
            console.log(rootNode);
        }
        return { };
    }
}