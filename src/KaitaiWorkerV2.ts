declare var currentScriptSrc: string;
declare var methods: any;

let baseDir = new URL('../', currentScriptSrc).href;
function importAll(...fns: string[]) {
    importScripts(...fns.map(fn => new URL(fn, baseDir).href));
}

try {
    importAll('lib/kaitai/kaitai-struct-compiler-fastopt.js');
    var compiler = new io.kaitai.struct.MainJs();
    console.log('Kaitai Worker V2!', compiler, methods);

    methods.compile = (src: string) => {
        console.log('Will compile', src);
    };
}
catch(e){
    console.log("Worker error", e);
}