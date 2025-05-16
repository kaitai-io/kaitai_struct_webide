export class DelayAction {
    private timeout: number;

    constructor(public delay: number) {
    }

    public do(func: () => void) {
        if (this.timeout)
            clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.timeout = null;
            func();
        }, this.delay);
    }
}


