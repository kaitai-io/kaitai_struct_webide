meta:
  id: test
  file-extension: test
  endian: le
seq:
  - id: repeat_eos
    type: u4
    repeat: eos
  - id: repeat_expr
    type: u4
    repeat: expr
    repeat-expr: 4
  - id: repeat_until
    type: u4
    repeat: until
    repeat-until: _ == 1
  - id: contents
    contents: "hello"
types:
  sub_type:
    seq:
      - id: field1
        type: u2be
    types:
      sub_sub_type:
        seq:
          - id: field1
            type: u4be
        enums:
          enum1:
            1: a
            2: b
        instances:
          prop1:
            value: field1 * 2
          prop2:
            pos: field1
            size-eos: true
          prop3:
            pos: field1
            size: prop1
          prop4:
            pos: field1
            terminator: 5