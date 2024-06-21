class AmdModule {
    amdLoading: boolean = false;
    loaded: boolean = false;
    loadPromise: Promise<AmdModule> = null;
    loadPromiseResolve: any = null;
    exports: any;

    constructor(public url: string) {
        //console.log("create module url", url);
     }
}

const isWorker = typeof window === "undefined";

this["module"] = { exports: null };
if (isWorker)
    this["window"] = { exports: null };

class AmdLoader {
    modules: { [url: string]: AmdModule } = {};
    paths: { [name: string]: string } = {};
    projectBase = "";
    moduleLoadedHook: (module: AmdModule) => Promise<void> = null;
    beforeLoadHook: (module: AmdModule) => Promise<void> = null;

    constructor() {
        this.projectBase = isWorker ? "" : window.location.href;
    }

    get currentScriptSrc(){ return typeof document !== "undefined" ? document.currentScript["src"] : self["currentScriptSrc"]; }

    loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof document === "undefined") {
                try {
                    const oldScriptSrc = self["currentScriptSrc"];
                    self["currentScriptSrc"] = src;
                    //console.log(`importScripts("${src}")`);
                    importScripts(src);
                    self["currentScriptSrc"] = oldScriptSrc;
                    resolve();
                } catch(e) {
                    reject(e);
                }
            } else {
                let scriptEl = document.createElement("script");
                scriptEl.onload = e => resolve();
                scriptEl.onerror = e => reject(e);
                scriptEl.src = src;
                document.head.appendChild(scriptEl);
            }
        });
    }

    getUrlFromName(name: string, baseUrl?: string): string {
        // if (typeof name !== "string") debugger;

        let isRelative = name.startsWith("./") || name.startsWith("../");
        let pathMatches = Object.keys(this.paths).filter(path => name === path || name.startsWith(path + "/"));
        if (pathMatches.length > 1)
            throw Error(`Module "${name}" can be loaded from multiple paths: ${pathMatches.join(", ")}`);

        let url =
            isRelative ? new URL(`${name}.js`, baseUrl || this.currentScriptSrc || this.projectBase).href :
            pathMatches.length > 0 ? new URL(`${this.paths[pathMatches[0]]}${name.substr(pathMatches[0].length)}.js`, this.projectBase).href :
            new URL(`js/${name}.js`, this.projectBase).href;

        return url;
    }

    getModule(name: string): AmdModule {
        var url = this.getUrlFromName(name);
        var module = this.modules[url] || (this.modules[url] = new AmdModule(url));
        return module;
    }

    async getLoadedModule(name: string): Promise<AmdModule> {
        var module = this.getModule(name);
        if (module.exports)
            return module;

        if (!module.loadPromise) {
            //console.log("getDep", url);
            // console.log("baseURI", document.currentScript.baseURI, "src",document.currentScript.src);
            var loadPromiseReject: (arg: any) => void;
            module.loadPromise = new Promise<AmdModule>((resolve, reject) => {
                module.loadPromiseResolve = resolve;
                loadPromiseReject = reject;
            });

            if (this.beforeLoadHook)
                await this.beforeLoadHook(module);

            //console.log("will load ", module.url, "exports", module.exports, "module", module);
            this.loadScript(module.url).then(() => this.onScriptLoaded(module), x => loadPromiseReject(module.url));
        }
        return module.loadPromise;
    }

    async onModuleLoaded(moduleDesc: AmdModule, value: any) {
        //console.log("onModuleLoaded", moduleDesc.url, value);

        if (!value) {
            debugger;
            throw new Error(`Module result is null! ${moduleDesc.url}`);
        }

        moduleDesc.exports = value;
        if (this.moduleLoadedHook)
            await this.moduleLoadedHook(moduleDesc);
        if (moduleDesc.loadPromiseResolve)
            moduleDesc.loadPromiseResolve(moduleDesc);
        moduleDesc.loaded = true;
    }

    async onScriptLoaded(module: AmdModule) {
        //console.log("script loaded", module.url);
        if (!module.loaded && !module.amdLoading)
            this.onModuleLoaded(module, self["module"].exports || self["window"]);
    }

    parseArgs(argumentsObj: IArguments|any[], isDefine: boolean) {
        let args = Array.from(argumentsObj);
        let callback = args.filter(x => typeof x === "function")[0];
        let name = args.filter(x => typeof x === "string")[0];
        let deps = args.filter(x => Array.isArray(x))[0] || [];
        if (isDefine)
            return [name, deps, callback];
        else
            return [deps.concat(name ? [name] : []), callback];
    }

    requireLoaded(name: string, requireBase?: string) {
        var url = this.getUrlFromName(name, requireBase);
        if (!(url in this.modules))
            throw Error(`Tried to sync require a not yet loaded module "${name}" (requireBase = "${requireBase}).`);
        return this.modules[url].exports;
    }

    internalRequire(args: any[], requireBase: string) {
        if(args.length === 1 && typeof args[0] === "string")
            return this.requireLoaded(args[0], requireBase);
        return this.require.apply(this, this.parseArgs(args, false));
    }

    async require(deps: string[], callback?: any, module?: AmdModule) {
        //console.log("require", deps, callback);

        let moduleObj = { exports: {} };
        //console.log("require before DEPS", deps);
        let depRes = await Promise.all(deps.map(dep =>
            dep === "exports" ? moduleObj.exports :
            dep === "module" ? moduleObj :
            dep === "require" ? (...args: any[]) => { return this.internalRequire(args, module && module.url); } :
            this.getLoadedModule(dep).then(x => x.exports)));
        //console.log("require AFTER DEPS", deps);

        let callbackResult = callback && callback(...depRes);
        return callbackResult || moduleObj.exports;
    }

    async define(name: string, deps: string[], callback: any) {
        //console.log("define", this.currentScriptSrc, name, deps, callback);

        let moduleDesc = name ? this.getModule(name) : this.currentScriptSrc && this.modules[this.currentScriptSrc];
        if (moduleDesc)
            moduleDesc.amdLoading = true;

        var promise = async () => {
            //console.log("define before REQUIRE", name, deps);
            let moduleValue = await this.require(deps, callback, moduleDesc);

            //console.log("define depRes", currScript && currScript.src, depRes);
            if (moduleDesc)
                await this.onModuleLoaded(moduleDesc, moduleValue);

            //console.log("define ENDED", currScript, name, deps, callback);
            return moduleDesc;
        };

        if (moduleDesc && !moduleDesc.loadPromise)
            moduleDesc.loadPromise = promise();
        else
            promise();
    }

    get notLoaded() { return Object.values(this.modules).filter(x => !x.loaded); }
}

let loader = new AmdLoader;

function require(...args: any[]) {
    if(args.length === 1 && typeof args[0] === "string")
        return loader.requireLoaded(args[0]);
    return loader.require.apply(loader, loader.parseArgs(args, false));
}

function define() {
    return loader.define.apply(loader, loader.parseArgs(arguments, true));
}

define["amd"] = true;
this["requirejs"] = require; // hack to bypass requirejs detections