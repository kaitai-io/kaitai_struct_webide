import Vue from "vue";
import * as $ from "jquery";
import {ArrayUtils} from "../v1/utils/Misc/ArrayUtils";
import {RegexUtils} from "../v1/utils/Misc/RegexUtils";
import {Stepper} from "./Components/Stepper";
import {ConverterPanel} from "./Components/ConverterPanel";
import {SelectionInput} from "./Components/SelectionInput";


class ComponentLoader {
    templates: { [name: string]: string } = {};
    templatePromises: { [name: string]: ((template: string) => void)[] } = {};

    async load(names: string[]): Promise<void> {
        const stepperTemplate = await this.loadTemplate("src/ui/Stepper.html");
        const converterTemplate = await this.loadTemplate("src/ui/Stepper.html");
        const selectionTemplate = await this.loadTemplate("src/ui/Stepper.html");
        Stepper.options.template = stepperTemplate;
        ConverterPanel.options.template = converterTemplate;
        SelectionInput.options.template = selectionTemplate;
        this.templates = {
            "Components/Stepper": stepperTemplate,
            "Components/ConverterPanel": ConverterPanel,
            "Components/SelectionInput": SelectionInput,
        }

    }

    async loadTemplate(url: string): Promise<void> {
        const html = await Promise.resolve($.get(url));
        const htmlTagRegex = new RegExp("(?:^|\n)<(.*?)( [^]*?)?>([^]*?)\n</", "gm");

        RegexUtils.matches(htmlTagRegex, html).forEach(tagMatch => {
            var tag = tagMatch[1], content = tagMatch[3], attrs: any = {};
            var attributeRegex = /\s(\w+)="(\w+)"/g;
            RegexUtils.matches(attributeRegex, tagMatch[2]).forEach(attrMatch => attrs[attrMatch[1]] = attrMatch[2]);

            if (tag === "template") {
                var jsClassName = attrs.id || ArrayUtils.last(url.split("/")).replace(".html", "");
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

}

export var componentLoader = new ComponentLoader();