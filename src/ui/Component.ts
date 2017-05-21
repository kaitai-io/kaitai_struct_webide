/**warn
  * Original code:
  *   vue-class-component v5.0.1
  *   (c) 2015-2017 Evan You
  *   @license MIT
  */
import * as Vue from "vue";
import { ComponentOptions } from "vue";

export const $internalHooks = [
    "data",
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeDestroy",
    "destroyed",
    "beforeUpdate",
    "updated",
    "activated",
    "deactivated",
    "render"
];

export type VueClass = { new(): Vue } & typeof Vue;

export function componentFactory(
    Component: VueClass,
    options: ComponentOptions<any> = {}
): VueClass {
    options.name = options.name || (Component as any)._componentTag || (Component as any).name;
    // prototype props.
    const proto = Component.prototype;
    Object.getOwnPropertyNames(proto).forEach(function(key) {
        if (key === "constructor") {
            return;
        }
        // hooks
        if ($internalHooks.indexOf(key) > -1) {
            options[key] = proto[key];
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (typeof descriptor.value === "function") {
            // methods
            (options.methods || (options.methods = {}))[key] = descriptor.value;
        } else if (descriptor.get || descriptor.set) {
            // computed properties
            (options.computed || (options.computed = {}))[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });

    // add data hook to collect class properties as Vue instance's data
    (options.mixins || (options.mixins = [])).push({
        data() {
            return collectDataFromConstructor(this, Component);
        }
    });

    if (!options.props)
        options.props = {};

    if (!options.props["model"])
        options.props["model"] = Object;

    // find super
    const superProto = Object.getPrototypeOf(Component.prototype);
    const Super = superProto instanceof Vue ? superProto.constructor as VueClass : Vue;
    const result = Super.extend(options);
    Vue.component(options.name, result);
    return result;
}

export function collectDataFromConstructor(vm: Vue, Component: VueClass) {
    // override _init to prevent to init as Vue instance
    Component.prototype._init = function () {
        // proxy to actual vm
        const keys = Object.getOwnPropertyNames(vm);
        // 2.2.0 compat (props are no longer exposed as self properties)
        if (vm.$options.props) {
            for (var key in vm.$options.props) {
                if (!vm.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
        }
        keys.forEach(key => {
            if (key.charAt(0) !== "_") {
                Object.defineProperty(this, key, {
                    get: () => vm[key],
                    set: value => vm[key] = value
                });
            }
        });
    };

    // should be acquired class property values
    const data = new Component();

    // create plain data object
    const plainData: any = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            plainData[key] = data[key];
        }
    });

    return plainData;
}

function Component<U extends Vue>(options: ComponentOptions<U>): <V extends VueClass>(target: V) => V;
function Component<V extends VueClass>(target: V): V;
function Component<V extends VueClass, U extends Vue>(
    options: ComponentOptions<U> | V
): any {
    if (typeof options === "function") {
        return componentFactory(options);
    }
    return function (Component: V) {
        return componentFactory(Component, options);
    };
}

namespace Component {
    export function registerHooks(keys: string[]): void {
        $internalHooks.push(...keys);
    }
}

export default Component;
