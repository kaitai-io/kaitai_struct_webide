import dateFormat = require("dateformat");

class PerformanceHelper {
    public logPerformance: boolean = true;

    public measureAction(actionName: string): PerformanceHelper.ActionMeasurement;
    public measureAction<T>(actionName: string, donePromise: Promise<T>): Promise<T>;
    public measureAction<T>(actionName: string, action: (() => T)): T;

    public measureAction<T>(actionName: string, donePromiseOrAction?: Promise<T> | (() => T)): any {
        var actionMeasurement = new PerformanceHelper.ActionMeasurement(this, actionName, performance.now());
        if (typeof donePromiseOrAction === "function") {
            try {
                var result = (<(() => T)>donePromiseOrAction)();
                this.actionDone(actionMeasurement, false);
                return result;
            } catch(e) {
                this.actionDone(actionMeasurement, true);
                throw e;
            }
        }
        else if (donePromiseOrAction)
            return actionMeasurement.done(<Promise<T>> donePromiseOrAction);
        else
            return actionMeasurement;
    }

    actionDone(action: PerformanceHelper.ActionMeasurement, failed?: boolean) {
        if (!this.logPerformance) return;
        console.info(`[performance/${dateFormat(new Date(), "ss.l")}] ${action.name} took `
            + `${Math.round(performance.now() - action.startTime)} milliseconds${failed ? " before it failed" : ""}.`);
    }
}

module PerformanceHelper {
    export class ActionMeasurement {
        public constructor(public ph: PerformanceHelper, public name: string, public startTime: number) { }

        public done(): void;
        public done<T>(promise: Promise<T>): Promise<T>;

        public done<T>(promise?: Promise<T>, failed?: boolean) {
            if (!promise)
                this.ph.actionDone(this);
            else
                return promise.then(x => { this.ph.actionDone(this, false); return x; }, x => { this.ph.actionDone(this, true); return Promise.reject(x); });
        }
    }
}

export var performanceHelper = new PerformanceHelper();