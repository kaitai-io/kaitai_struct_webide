declare module "vue-class-component" {
    export const $internalHooks: string[];
    export let $decoratorQueue: ((options: Vue.ComponentOptions<Vue>) => void)[];
    export function componentFactory(Component: VueClass, options?: Vue.ComponentOptions<any>): VueClass;

    export function collectDataFromConstructor(vm: Vue, Component: VueClass): {};

    export type VueClass = {
        new (): Vue;
    } & typeof Vue;

    export function Component<U extends Vue>(options: Vue.ComponentOptions<U>): <V extends VueClass>(target: V) => V;
    export function Component<V extends VueClass>(target: V): V;
    export namespace Component {
        function registerHooks(keys: string[]): void;
    }
    export default Component;

    export const noop: () => void;
    export function createDecorator(factory: (options: Vue.ComponentOptions<Vue>, key: string) => void): (target: Vue, key: string) => void;
    export function createDecorator(factory: (options: Vue.ComponentOptions<Vue>, key: string, index: number) => void): (target: Vue, key: string, index: number) => void;
    export function warn(message: string): void;     
}
