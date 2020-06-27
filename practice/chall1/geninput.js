const { writeFileSync } = require("fs");
let i = 0;
const buf = Buffer.alloc(0x3a);
i = buf.writeUInt8(42, i);
i = buf.writeInt16LE(-1337, i);
i = buf.writeFloatLE(3.33, i);
// TODO: Switch to writeBigInt64BE, available in Node v12.0.0:
//       i = buf.writeBigInt64BE(1n, i);
i = buf.writeInt32BE(0, i);
i = buf.writeInt32BE(1, i);
i = buf.write("★★★ Congratulations! ★★★\0EOFEOF", i, "utf-8");
writeFileSync("input.bin", buf);
