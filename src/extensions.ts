// tslint:disable-next-line
interface Array<T> {
    remove(item: T): void;
}

/*
* This method needs to be initialized, otherwise JSTree has some internal problem.
* Problem is not thrown or logged to the console, but "Local storage" fileTree stops loading on page refresh.
* What is more, is that this function is probably never called since console log is not executed.
* What a freaking joke...
* */
if (!Array.prototype.remove) {
    Array.prototype.remove = function <T>(item: T) {
        console.log("Why are we still here? Just to suffer");
    };
}
