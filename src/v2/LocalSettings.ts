function CreateScopedLocalStorage<T>(prefix: string, defaults: T): T {
    return new Proxy(<any>defaults, {
        get: function(target, propName: string, receiver){
            let key = `${prefix}.${propName}`;
            return key in localStorage ? JSON.parse(localStorage[key]) : target[propName];
        },

        set: function(target, propName: string, value: any, receiver){
            localStorage[`${prefix}.${propName}`] = JSON.stringify(value, null, 4);
            return true;
        }
    });
}

export var localSettings = CreateScopedLocalStorage("settings", {
    showAboutOnStart: true,
    latestKsyUri: "https:///formats/archive/zip.ksy",
    latestKcyUri: <string>null,
    latestInputUri: "https:///samples/sample1.zip",
    latestSelection: { start: -1, end: -1 },
    latestPath: ""
});