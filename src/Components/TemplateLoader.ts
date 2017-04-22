import * as Vue from "vue";

declare function require(deps: string[], callback: (obj: any[]) => void): void;

class ComponentLoader {
    load(names: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            require(names.map(name => `./${name}/${name}`), (...modules: any[]) => {
                Promise.all(names.map((name, i) => this.loadTemplate(name, modules[i]))).then(() => resolve());
            });
        });
    }

    loadTemplate(name: string, module: any): Promise<void> {
        return Promise.resolve($.get(`src/Components/${name}/${name}.html`)).then(html => {
            new RegExp("(?:^|\n)<(.*?)( [^]*?)?>([^]*?)\n</", "gm").matches(html).forEach(tagMatch => {
                var tag = tagMatch[1], content = tagMatch[3], attrs: any = {};
                /\s(\w+)="(\w+)"/g.matches(tagMatch[2]).forEach(attrMatch => attrs[attrMatch[1]] = attrMatch[2]);

                if(tag === "template")
                    module[attrs.id].options.template = content;
                else if (tag === "style")
                    $("<style>").text(content).appendTo($(document.body));
            });
        });
    }
};

window["vue"] = Vue;

export var componentLoader = new ComponentLoader();