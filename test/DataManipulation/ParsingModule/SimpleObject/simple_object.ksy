meta:
  id: simple_object
  endian: le

seq:
  - id: header
    type: t_header
  - id: value1
    type: u4

instances:
  someinstance:
    value: _root.header.header_field_x + _root.header.header_field_a

types:
  t_header:
    seq:
      - id: header_field_x
        type: u4
      - id: header_field_a
        type: s2