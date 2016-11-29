# coding=utf-8
import struct

open('input.bin', 'wb').write(struct.pack('<Bhf', 42, -1337, 3.33) + struct.pack('>Q', 1) + '★★★ Congratulations! ★★★\0EOFEOF')