export class RegexUtils {
    public static matches(regex: RegExp, input: string) {
        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray;
        while (match = regex.exec(input))
            matches.push(match);
        return matches;
    }
}