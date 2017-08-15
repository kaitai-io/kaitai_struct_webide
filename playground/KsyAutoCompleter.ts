/// <reference path="../lib/ts-types/ace.d.ts" />

import * as ace from "ace/ace";

declare var YAML: any;

interface ISuggestionData {
    regex: RegExp;
    suggestions: string[];
    generator: () => string[];
}

interface IContext {
    current: string;
    parent: string;
}

interface IAceSuggestion {
    value: string;
    caption?: string;
    score?: number;
}

class YamlHelper {
    static getLineInfoFromYaml(yaml: any) {
        const lineDict = {};

        function parseObject(path: string, currNode: any) {
            if (currNode.$meta)
                for (const fieldName of Object.keys(currNode.$meta))
                    lineDict[currNode.$meta[fieldName]] = `${path}/${fieldName}`;

            for (const fieldName of Object.keys(currNode).filter(x => x !== "$meta")) {
                const value = currNode[fieldName];
                if (value && typeof value === "object")
                    parseObject(`${path}/${fieldName}`, currNode[fieldName]);
            }
        }

        //console.log("yaml", yaml, "lineDict", lineDict);
        parseObject("", yaml);
        return lineDict;
    }
}

export class KsyAutoCompleter {
    suggestionData: ISuggestionData[];
    editor: AceAjax.Editor;
    ksy: any;
    context: IContext;

    constructor() {
        var attributeSpec = ["size", "type", "enum", "contents", "terminator", "include", "consume", "eos-error",
            "encoding", "process", "repeat", "repeat-eos", "repeat-expr", "repeat-until", "if", "doc", "doc-ref", "size-eos"];

        var suggestionList = {
            "meta": ["id", "title", "application", "file-extension", "xref", "license", "ks-version", "imports", "encoding", "endian"],
            "meta/endian": ["le", "be"],
            "meta/ks-version": ["0.8", "0.7"],
            "meta/license": ["CC0-1.0", "MIT", "Unlicense"],
            "(seq|instances)/[^/]+/type": [() => this.getRelativeSuggestions("types"), "u8", "u4", "u2", "u1", "s8", "s4", "s2", "s1", "f8", "f4",
                "str", "strz", "u8le", "u4le", "u2le", "s8le", "s4le", "s2le", "u8be", "u4be", "u2be", "s8be", "s4be", "s2be", "f8le", "f4le", "f8be", "f4be"],
            "seq(/\\d+)?": ["id", "-orig-id", ...attributeSpec],
            "(seq|instances)/[^/]+/encoding": ["UTF-8", "ASCII", "UTF-16LE", "UTF-16BE"],
            "(seq|instances)/[^/]+/enum": [() => this.getRelativeSuggestions("enums")],
            "(seq|instances)/[^/]+/repeat": ["expr", "until", "eos"],
            "(seq|instances)/[^/]+/repeat-eos": ["true"],
            "(seq|instances)/[^/]+/consume": ["false", "true"],
            "(seq|instances)/[^/]+/include": ["true", "false"],
            "(seq|instances)/[^/]+/eos-error": ["false", "true"],
            "(seq|instances)/[^/]+/size-eos": ["true", "false"],
            "(seq|instances)/[^/]+/terminator": ["0"],
            "(seq|instances)/[^/]+/process": ["zlib", "xor(key)", "rol(4)", "ror(4)"],
            "instances/[^/]+": ["value", "pos", "io", ...attributeSpec],
            "instances/[^/]+/io": ["_parent.io", "_root.io"],
            "(types/[^/]+|/)": ["seq", "instances", "enums", "types", "meta", "doc"],
        };

        this.initWithSuggestionList(suggestionList);
    }

    static async setup(editor: AceAjax.Editor) {
        const completer = new KsyAutoCompleter();
        editor["completers"] = [completer];
        //await loader.getLoadedModule("ace/ext-language_tools");
        editor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion: true });
        //console.log("auto completer", editor);
        return completer;
    }

    initWithSuggestionList(suggestionList: { [pattern: string]: any[] }) {
        this.suggestionData = [];
        for (const regexPattern of Object.keys(suggestionList)) {
            const result = <ISuggestionData>{ regex: new RegExp(regexPattern + "$"), suggestions: [], generator: null };

            for (const sugg of suggestionList[regexPattern])
                if (typeof sugg === "string")
                    result.suggestions.push(sugg);
                else if (typeof sugg === "function")
                    result.generator = sugg;

            this.suggestionData.push(result);
        }

        //console.log("suggestionData", this.suggestionData);
    }

    getCompletions(editor: AceAjax.Editor, session: any, pos: { start: number, end: number }, prefix: string, callback: any) {
        var suggestions: IAceSuggestion[] = [];

        try {
            this.editor = editor;
            this.ksy = YAML.parse(editor.getValue(), false, null, true);
            console.log(this.ksy);
            this.context = this.getContext(editor.getSelectionRange().start.row + 1);
            //console.log("context", this.context);

            if (this.context.current) {
                suggestions = this.generateSuggestions(this.context.current).map(x => ({ value: x }));
            } else {
                var parentObj = this.selectObject(this.context.parent);
                var parentKeys = parentObj ? Object.keys(parentObj) : [];
                suggestions = this.generateSuggestions(this.context.parent)
                    .filter(x => parentKeys.indexOf(x) === -1).map(x => ({ caption: x, value: `${x}: ` }));
            }

            for (var i = 0; i < suggestions.length; i++)
                if(!suggestions[i].score) suggestions[i].score = 1000 - i;

            //console.log("suggestions", suggestions);
        } catch(e) {
            console.error("KsyAutoCompleter exception", e);
        }

        callback(null, suggestions);
    }

    getContext(row: number) {
        const lineDict = YamlHelper.getLineInfoFromYaml(this.ksy);
        var linePadding = KsyAutoCompleter.getPaddingLen(this.editor.session.getLine(row - 1));

        var result = <IContext> {};
        if (lineDict[row])
            result.current = lineDict[row--];

        while(true && row >= 0) {
            var line = this.editor.session.getLine(row - 1);
            if (KsyAutoCompleter.getPaddingLen(line) < linePadding && lineDict[row]) {
                // "seq/0/id" and "seq/0" are on the same line, but we want to get "seq/0", not "seq/0/id"
                result.parent = line.trim().startsWith("- ") ? KsyAutoCompleter.getParentPath(lineDict[row]) : lineDict[row];
                break;
            }
            row--;
        }

        if (linePadding === 0)
            result.parent = result.parent || "/";

        return result;
    }

    generateSuggestions(path: string) {
        for (const sugg of this.suggestionData)
            if (sugg.regex.exec(path)) {
                const suggestions = sugg.generator ? sugg.generator() : [];
                return suggestions.concat(sugg.suggestions);
            }
        return [];
    }

    getRelativeSuggestions(type: "enums"|"types") {
        const enumRoots = [""];

        const path = this.context.current.split("/");
        for (var i = 0; i < path.length; i++)
            if (path[i] === "types")
                enumRoots.push(path.slice(0, i + 2).join("/"));

        return KsyAutoCompleter.flattenArray(enumRoots.map(enumRoot => Object.keys(this.selectObject(`${enumRoot}/${type}`) || {}))).filter(x => x !== "$meta");
    }

    selectObject(path: string) {
        return path === "/" ? this.ksy : path.substr(1).split("/").reduce((curr, name) => curr[name], this.ksy);
    }

    static flattenArray<T>(arr: T[][]) { return <T[]> [].concat.apply([], arr); }

    static getPaddingLen(line: string) {
        for(let i = 0; i < line.length; i++)
            if(line[i] !== " ")
                return i;
        return line.length;
    }

    static getParentPath(path: string) {
        var parts = path.split("/");
        parts.pop();
        return parts.join("/");
    }
}

