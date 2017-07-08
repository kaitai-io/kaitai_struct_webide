import * as Vue from "vue";
import * as $ from "jquery";

declare function require(deps: string[], callback: (obj: any[]) => void): void;

class ComponentLoader {
    templates: { [name: string]: string } = {};
    templatePromises: { [name: string]: ((template: string) => void)[] } = {};

    load(names: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            require(names.map(name => `./${name}`), (...modules: any[]) => {
                Promise.all(names.map((name, i) =>
                    this.loadTemplateAndSet(`src/ui/${name}.html`, modules[i]))).then(() => resolve());
            });
        });
    }

    onLoad(name: string): Promise<string> {
        if (!name) throw Error("Invalid component name!");

        if (this.templates[name])
            return Promise.resolve(this.templates[name]);

        return new Promise<string>((resolve, reject) => {
            this.templatePromises[name] = this.templatePromises[name] || [];
            this.templatePromises[name].push(resolve);
        });
    }

    async loadTemplate(url: string): Promise<void> {
        var html = await Promise.resolve($.get(url));

        new RegExp("(?:^|\n)<(.*?)( [^]*?)?>([^]*?)\n</", "gm").matches(html).forEach(tagMatch => {
            var tag = tagMatch[1], content = tagMatch[3], attrs: any = {};
            /\s(\w+)="(\w+)"/g.matches(tagMatch[2]).forEach(attrMatch => attrs[attrMatch[1]] = attrMatch[2]);

            if (tag === "template") {
                var jsClassName = attrs.id || url.split("/").last().replace(".html", "");
                var template = this.templates[jsClassName] = content.replace(/<!--nobr-->\s*/gi, "");
                if (this.templatePromises[jsClassName]) {
                    for (var resolve of this.templatePromises[jsClassName])
                        resolve(template);
                    delete this.templatePromises[jsClassName];
                }
            }

            else if (tag === "style")
                $("<style>").text(content).appendTo($(document.body));
        });
    }

    async loadTemplateAndSet(url: string, module: any): Promise<void> {
        await this.loadTemplate(url);

        for (var componentName of Object.keys(module)) {
            if (!this.templates[componentName])
                continue;
                //throw new Error(`Template not found for component: ${componentName}`);
            module[componentName].options.template = this.templates[componentName];
        }
    }
}

window["vue"] = Vue;

export var componentLoader = new ComponentLoader();