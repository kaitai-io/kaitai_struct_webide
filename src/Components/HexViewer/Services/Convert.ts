export const convertByteToEmoji = (byte: number) => {
    const baseEmojiCodePoint = 0x1F347;
    const emojiCodePoint = baseEmojiCodePoint + byte;

    return String.fromCodePoint(emojiCodePoint);
};

export const convertByteToAsciiCharacter = (byte: number) => {
    return byte === 32 ? "\u00a0" :
        byte < 32 || (0x7f <= byte && byte <= 0xa0) || byte === 0xad ? "." :
            String.fromCharCode(byte);
};
