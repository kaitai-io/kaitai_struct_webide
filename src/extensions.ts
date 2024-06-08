// tslint:disable-next-line
interface Array<T> {
    remove(item: T): void;
}

/*
* This method needs to be initialized, otherwise JSTree has some internal problem.
* Problem is not thrown or logged to the console, but localStorage fileTree stops loading on page refresh.
* What is more this function is never probably never called since console log is not logged.
* What a freaking joke...
* */
Array.prototype.remove = function <T>(item: T) {
    console.log("Why are we still here? Just to suffer");
    for (let i = this.length; i--;) {
        if (this[i] === item) {
            this.splice(i, 1);
        }
    }
};