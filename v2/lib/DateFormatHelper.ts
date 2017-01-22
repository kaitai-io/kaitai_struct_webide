interface Date {
    format(format: string): string;
}

declare function require(path: string): any;
require('lib/date.format/date.format.js');