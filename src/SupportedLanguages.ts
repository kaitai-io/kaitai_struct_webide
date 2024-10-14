export interface SupportedLanguage {
    kaitaiLangCode: string;
    aceEditorLangCode: string;
    isDebug: boolean;
    text: string;
}

export const SupportedLanguages: SupportedLanguage[] = [
    {kaitaiLangCode: "cpp_stl", aceEditorLangCode: "c_cpp", isDebug: false, text: "CPP-STL"},
    {kaitaiLangCode: "csharp", aceEditorLangCode: "csharp", isDebug: false, text: "C#"},
    {kaitaiLangCode: "go", aceEditorLangCode: "golang", isDebug: false, text: "Go"},
    {kaitaiLangCode: "graphviz", aceEditorLangCode: "dot", isDebug: false, text: "Graphviz"},
    {kaitaiLangCode: "java", aceEditorLangCode: "java", isDebug: false, text: "Java"},
    {kaitaiLangCode: "java", aceEditorLangCode: "java", isDebug: true, text: "Java (debug)"},
    {kaitaiLangCode: "javascript", aceEditorLangCode: "javascript", isDebug: false, text: "JavaScript"},
    {kaitaiLangCode: "javascript", aceEditorLangCode: "javascript", isDebug: true, text: "JavaScript (debug)"},
    {kaitaiLangCode: "lua", aceEditorLangCode: "lua", isDebug: false, text: "Lua"},
    {kaitaiLangCode: "nim", aceEditorLangCode: "nim", isDebug: false, text: "Nim"},
    {kaitaiLangCode: "perl", aceEditorLangCode: "perl", isDebug: false, text: "Perl"},
    {kaitaiLangCode: "php", aceEditorLangCode: "php", isDebug: false, text: "PHP"},
    {kaitaiLangCode: "python", aceEditorLangCode: "python", isDebug: false, text: "Python"},
    {kaitaiLangCode: "ruby", aceEditorLangCode: "ruby", isDebug: false, text: "Ruby"},
    {kaitaiLangCode: "ruby", aceEditorLangCode: "ruby", isDebug: true, text: "Ruby (debug)"},
    {kaitaiLangCode: "json", aceEditorLangCode: "json", isDebug: false, text: "JSON"},
];