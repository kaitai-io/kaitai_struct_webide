export class JsImporterError extends Error {

    // The default implementation of the Error.prototype.toString() method gives
    // "Error: {message}", see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/toString#description
    // However, the error we're throwing here goes directly into the KSC code,
    // which will add its own `error: ` prefix (as the severity of the problem),
    // so the resulting message would contain `error: Error: ...`. By overriding
    // toString() to omit the `Error: ` part, we can make the message a bit nicer.
    toString() {
        return this.message;
    }
}