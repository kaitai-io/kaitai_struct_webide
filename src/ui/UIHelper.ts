export default class UIHelper {
    static findParent<T>(base: Vue, type: new () => T): T {
        var res: Vue = base;
        while (res) {
            if (res instanceof type)
                return <T>res;
            res = res.$parent;
        }
        return null;        
    }
}