meta:
#
#
#
  a:
  id: intellisense_test
  file-extension: intellisense_test
  endian: le
  title: ""
  application: ""
  ks-version: 0.
  license: CC0-1.0
doc:
  5
seq:
  - id: test
    type: str
    enum: enum1
    encoding: ASCII
    repeat: expr
    repeat-eos: true
    doc: 
      - x: a
    eos-error: false
    terminator: 0
    process: xor(key)
    
    consume: false
  - 
    eos-error: false
    encoding: UTF-8
    include: true
  - a: b
    c: dd
    
enums:
  enum1:
    1: a
  enum2:
    2: b
types:
  test_type:
    seq:
      - id: f1
        encoding: UTF-8
        process: zlib
        size-eos: true
        enum: enum3
        type: s8
    instances:
      test_instance:
        io: _parent.io
    enums: 
      enum3:
        a: 1
    types: 
      new_type:
        seq: 
          - id: test
    meta: 
    doc: 
instances: 
asdasd:
