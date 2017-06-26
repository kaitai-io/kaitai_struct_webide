export class ExposedPromise<T> extends Promise<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void){
        super((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            executor(resolve, reject);
        });
    }
}