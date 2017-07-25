// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

var Test = (function() {
  function Test(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Test.prototype._read = function() {
    this.repeatEos = [];
    while (!this._io.isEof()) {
      this.repeatEos.push(this._io.readU4le());
    }
    this.repeatExpr = new Array(4);
    for (var i = 0; i < 4; i++) {
      this.repeatExpr[i] = this._io.readU4le();
    }
    this.repeatUntil = []
    do {
      var _ = this._io.readU4le();
      this.repeatUntil.push(_);
    } while (!(_ == 1));
    this.contents = this._io.ensureFixedContents([104, 101, 108, 108, 111]);
  }

  var SubType = Test.SubType = (function() {
    function SubType(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SubType.prototype._read = function() {
      this.field1 = this._io.readU2be();
    }

    var SubSubType = SubType.SubSubType = (function() {
      SubSubType.Enum1 = Object.freeze({
        A: 1,
        B: 2,

        1: "A",
        2: "B",
      });

      function SubSubType(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;

        this._read();
      }
      SubSubType.prototype._read = function() {
        this.field1 = this._io.readU4be();
      }
      Object.defineProperty(SubSubType.prototype, 'prop1', {
        get: function() {
          if (this._m_prop1 !== undefined)
            return this._m_prop1;
          this._m_prop1 = (this.field1 * 2);
          return this._m_prop1;
        }
      });
      Object.defineProperty(SubSubType.prototype, 'prop2', {
        get: function() {
          if (this._m_prop2 !== undefined)
            return this._m_prop2;
          var _pos = this._io.pos;
          this._io.seek(this.field1);
          this._m_prop2 = this._io.readBytesFull();
          this._io.seek(_pos);
          return this._m_prop2;
        }
      });
      Object.defineProperty(SubSubType.prototype, 'prop3', {
        get: function() {
          if (this._m_prop3 !== undefined)
            return this._m_prop3;
          var _pos = this._io.pos;
          this._io.seek(this.field1);
          this._m_prop3 = this._io.readBytes(this.prop1);
          this._io.seek(_pos);
          return this._m_prop3;
        }
      });
      Object.defineProperty(SubSubType.prototype, 'prop4', {
        get: function() {
          if (this._m_prop4 !== undefined)
            return this._m_prop4;
          var _pos = this._io.pos;
          this._io.seek(this.field1);
          this._m_prop4 = this._io.readBytesTerm(5, false, true, true);
          this._io.seek(_pos);
          return this._m_prop4;
        }
      });

      return SubSubType;
    })();

    return SubType;
  })();

  return Test;
})();

// Export for amd environments
if (typeof define === 'function' && define.amd) {
  define('Test', [], function() {
    return Test;
  });
}

// Export for CommonJS
if (typeof module === 'object' && module && module.exports) {
  module.exports = Test;
}
