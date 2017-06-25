class AmdModule {
    loaded: boolean = false;
    loadPromise: Promise<AmdModule> = null;
    loadPromiseResolve: any = null;
    exports: any;

    constructor(public url: string){ }
}

window["module"] = { exports: null };

class AmdLoader {
    modules: { [url: string]: AmdModule } = {};
    paths: { [name: string]: string } = {};
    moduleLoadedHook: (module: AmdModule) => Promise<void> = null;
    beforeLoadHook: (module: AmdModule) => Promise<void> = null;

    loadWithScriptTag(src: string): Promise<HTMLScriptElement> {
        return new Promise((resolve, reject) => {
            let scriptEl = document.createElement("script");
            scriptEl.onload = e => resolve(scriptEl);
            scriptEl.onerror = e => reject(e);
            scriptEl.src = src;
            document.head.appendChild(scriptEl);            
        });
    }

    async getLoadedModule(name: string): Promise<AmdModule>{
        let isRelative = name.startsWith('./') || name.startsWith('../');            
        let url = 
            isRelative ? new URL(`${name}.js`, document.currentScript["src"] || window.location).href :
            name in this.paths ? new URL(`${this.paths[name]}.js`, window.location.href).href :
            new URL(`js/${name}.js`, window.location.href).href;
        var module = this.modules[url] || (this.modules[url] = new AmdModule(url));
        if (!module.loadPromise){
            //console.log('getDep', url);
            // console.log('baseURI', document.currentScript.baseURI, 'src',document.currentScript.src);
            var loadPromiseReject;
            module.loadPromise = new Promise<AmdModule>((resolve, reject) => {
                module.loadPromiseResolve = resolve;
                loadPromiseReject = reject;
            });
            
            if (this.beforeLoadHook)
                await this.beforeLoadHook(module);

            this.loadWithScriptTag(url).then(x => this.onScriptLoaded(module), loadPromiseReject);
        }
        return module.loadPromise;
    }

    async onModuleLoaded(moduleDesc: AmdModule, value: any){
        console.log('onModuleLoaded', moduleDesc.url);
        moduleDesc.exports = value;
        if (this.moduleLoadedHook)
            await this.moduleLoadedHook(moduleDesc);
        moduleDesc.loadPromiseResolve(moduleDesc);
        moduleDesc.loaded = true;        
    }

    async onScriptLoaded(module: AmdModule){
        console.log('script loaded', module.url);
        if (!module.exports)
            module.exports = window["module"].exports;
        if (!module.loaded){
            module.loadPromiseResolve(module);
            module.loaded = true;
        }
        
        // let self = this;
        // let moduleObj = { 
        //     set exports(value: any){
        //         console.log('exports set triggered', module.url);
        //         self.onModuleLoaded(module, value);
        //     }
        // };
        // window["module"] = moduleObj;
        // if(!module.loaded){
        //     module.loadPromiseResolve(module);
        //     module.loaded = true;
        // }
    }

    async define(deps: string[], callback: any){
        let currScript = document.currentScript;
        //console.log('define', currScript, deps, callback);
        let exports = {};
        let depRes = await Promise.all(deps.map(dep => 
            dep === "exports" ? exports : 
            dep === "require" ? {} :
            this.getLoadedModule(dep).then(x => x.exports)));
        //console.log('define depRes', currScript && currScript.src, depRes);
        if (currScript && currScript["src"]){
            let moduleDesc = this.modules[currScript["src"]];
            let callbackResult = callback(...depRes);
            this.onModuleLoaded(moduleDesc, callbackResult || exports);
        }
    }
}

let loader = new AmdLoader;

function require(name: string){ loader.getLoadedModule(name); }
function define(){
    let args = Array.from(arguments);
    let callback = args.filter(x => typeof x === "function")[0];
    let deps = args.filter(x => Array.isArray(x))[0] || [];
    loader.define(deps, callback);    
}

define["amd"] = true;
