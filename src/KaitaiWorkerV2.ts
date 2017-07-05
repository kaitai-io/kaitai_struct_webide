declare var currentScriptSrc: string;
declare var methods: any;

let baseDir = new URL('../', currentScriptSrc).href;
function importAll(...fns: string[]) {
    importScripts(...fns.map(fn => new URL(fn, baseDir).href));
}

var window = self;

class KaitaiServices {
    compiler: KaitaiStructCompiler;

    ksyCode: string;
    ksy: KsySchema.IKsyFile;
    jsCode: string;

    classes: { [name: string]: any };
    mainClassName: string;

    input: ArrayBuffer;
    parsed: any;

    constructor(){
        this.compiler = new KaitaiStructCompiler();
    }

    async compileKsy(ksyCode: string) {
        this.ksyCode = ksyCode;
        this.ksy = YAML.parse(ksyCode);
        
        var releaseCode = await this.compiler.compile('javascript', this.ksy, null, false);
        var debugCode = await this.compiler.compile('javascript', this.ksy, null, true);
        var debugCodeAll = this.jsCode = Object.values(debugCode).join('\n');

        this.classes = {};

        var self = this;
        function define(name: string, deps: string[], callback: () => any){
            self.classes[name] = callback();
            self.mainClassName = name;
        }
        define["amd"] = true;
        
        eval(debugCodeAll);
        console.log('compileKsy', this.mainClassName, this.classes);

        return { releaseCode, debugCode, debugCodeAll };
    }

    setInput(input: ArrayBuffer) {
        this.input = input;

        console.log('setInput', this.input);
    }

    parse() {
        var mainClass = this.classes[this.mainClassName];
        this.parsed = new mainClass(new KaitaiStream(this.input, 0));
        this.parsed._read();

        console.log('parsed', this.parsed);
    }
}

try {
    importAll('lib/_npm/kaitai-struct-compiler/kaitai-struct-compiler.js', 'lib/_npm/yamljs/yaml.js', 'lib/_npm/kaitai-struct/KaitaiStream.js');

    var service = new KaitaiServices();
    console.log('Kaitai Worker V2!', service.compiler, methods, YAML);

    methods.compile = (ksyCode: string) => service.compileKsy(ksyCode);
    methods.setInput = (input: ArrayBuffer) => service.setInput(input);
    methods.parse = () => service.parse();
}
catch(e){
    console.log("Worker error", e);
}