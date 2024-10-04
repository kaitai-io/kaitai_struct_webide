export class TestHelper {
    static equals(value: any, compareTo: any): boolean {
        if (typeof value !== typeof compareTo)
            return false;

        if (typeof value === "string" || typeof value === "boolean" || typeof value === "number" || typeof value === "undefined")
            return value === compareTo;

        if (Array.isArray(value) && Array.isArray(compareTo)) {
            var length = compareTo.length;
            if (value.length !== length)
                return false;

            for (var i = 0; i < length; i++)
                if (!this.equals(value[i], compareTo[i]))
                    return false;

            return true;
        }

        var keys = Object.keys(compareTo).sort();
        if (!this.equals(Object.keys(value).sort(), keys))
            return false;

        if (keys.some(x => !this.equals(value[x], compareTo[x])))
            return false;

        return true;
    }

    static assertEquals(value: any, compareTo: any) {
        if (!this.equals(value, compareTo))
            console.error("assertEquals fail", value, compareTo, JSON.stringify(value));
    }
}
