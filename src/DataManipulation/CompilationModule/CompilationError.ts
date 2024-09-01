export class CompilationError {
    constructor(public type: "yaml" | "kaitai", public error: any) {
    }
}