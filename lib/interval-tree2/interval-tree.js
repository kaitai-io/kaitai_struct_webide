var IntervalTree = (function() {
    var Util = (function () {
        function Util() { }

        Util.assertNumber = function (val, desc) {
            if (val == null) {
                throw new Error(desc + ' is required.');
            }
            if (typeof val !== 'number') {
                throw new Error(desc + ' must be a number.');
            }
        };

        Util.assertOrder = function (start, end, startName, endName, desc) {
            if (start > end) {
                throw new Error(desc + ": " + startName + "(" + start + ") must be smaller than " + endName + "(" + end + ").");
            }
        };

        return Util;

    })();

    /**
    number with id
    
    @class Point
    @module interval-tree2
     */
    var Point = (function () {

        /**
        @constructor
        @param {Number} val number
        @param {Number|String} id id
         */
        function Point(val, id) {
            this.val = val;
            this.id = id;
        }

        return Point;

    })();

    /**
        extended array of objects, always sorted
        
        @class SortedList
        @extends Array
        @module interval-tree2
         */
    var SortedList,
      extend = function (child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
      hasProp = {}.hasOwnProperty;

    SortedList = (function (superClass) {
        extend(SortedList, superClass);


        /**
        @constructor
        @param {String} compareKey key name to compare objects. The value of the key must be a number.
         */


        /**
        key name to compare objects. The value of the key must be a number.
        @property {String} compareKey
         */

        function SortedList(compareKey) {
            this.compareKey = compareKey;
        }


        /**
        insert a value
        
        @method insert
        @param {any} val
        @return {Number} inserted position
         */

        SortedList.prototype.insert = function (val) {
            var pos;
            pos = this.bsearch(val);
            this.splice(pos + 1, 0, val);
            return pos + 1;
        };


        /**
        remove the value in the given position
        
        @method remove
        @param {Number} pos position
        @return {SortedList} self
         */

        SortedList.prototype.remove = function (pos) {
            this.splice(pos, 1);
            return this;
        };


        /**
        get maximum value in the list
        
        @method max
        @return {Number}
         */

        SortedList.prototype.max = function () {
            var ref;
            return (ref = this[this.length - 1]) != null ? ref[this.compareKey] : void 0;
        };


        /**
        get minimum value in the list
        
        @method min
        @return {Number}
         */

        SortedList.prototype.min = function () {
            var ref;
            return (ref = this[0]) != null ? ref[this.compareKey] : void 0;
        };


        /**
        binary search
        
        @method bsearch
        @param {any} val
        @return {Number} position of the value
         */

        SortedList.prototype.bsearch = function (val) {
            var comp, epos, mpos, mval, spos;
            if (!this.length) {
                return -1;
            }
            mpos = null;
            mval = null;
            spos = 0;
            epos = this.length;
            while (epos - spos > 1) {
                mpos = Math.floor((spos + epos) / 2);
                mval = this[mpos];
                comp = this.compare(val, mval);
                if (comp === 0) {
                    return mpos;
                }
                if (comp > 0) {
                    spos = mpos;
                } else {
                    epos = mpos;
                }
            }
            if (spos === 0 && this.compare(this[0], val) > 0) {
                return -1;
            } else {
                return spos;
            }
        };


        /**
        leftmost position of the given val
        
        @method firstPositionOf
        @param {any} val
        @return {Number} leftmost position of the value
         */

        SortedList.prototype.firstPositionOf = function (val) {
            var index, num, ref;
            index = this.bsearch(val);
            if (index === -1) {
                return -1;
            }
            num = val[this.compareKey];
            if (num === ((ref = this[index]) != null ? ref[this.compareKey] : void 0)) {
                while (true) {
                    if (index <= 0) {
                        break;
                    }
                    if (this[index - 1][this.compareKey] < num) {
                        break;
                    }
                    index--;
                }
            } else {
                index++;
            }
            return index;
        };


        /**
        rightmost position of the given val
        
        @method lastPositionOf
        @param {any} val
        @return {Number} rightmost position of the value
         */

        SortedList.prototype.lastPositionOf = function (val) {
            var index, num;
            index = this.bsearch(val);
            if (index === -1) {
                return -1;
            }
            num = val[this.compareKey];
            if (index === this.length - 1 && num > this.max()) {
                return index + 1;
            }
            while (true) {
                if (index + 1 >= this.length) {
                    break;
                }
                if (this[index + 1][this.compareKey] > num) {
                    break;
                }
                index++;
            }
            return index;
        };


        /**
         * sorted.toArray()
         * get raw array
         *
         */

        SortedList.prototype.toArray = function () {
            return this.slice();
        };


        /**
        comparison function. Compares two objects by this.compareKey
        
        @method compare
        @private
        @param {any} a
        @param {any} b
         */

        SortedList.prototype.compare = function (a, b) {
            var c;
            if (a == null) {
                return -1;
            }
            if (b == null) {
                return 1;
            }
            c = a[this.compareKey] - b[this.compareKey];
            if (c > 0) {
                return 1;
            } else if (c === 0) {
                return 0;
            } else {
                return -1;
            }
        };

        return SortedList;

    })(Array);

    /**
    node of IntervalTree, containing intervalsj
    
    @class Node
    @module interval-tree2
     */

    var Node = (function () {

        /**
        @constructor
        @param {Number} center center of the node
         */
        function Node(center) {
            this.center = center;

            /**
            another node whose center is less than this.center
            
            @property {Node} left
             */
            this.left = null;

            /**
            another node whose center is greater than this.center
            
            @property {Node} right
             */
            this.right = null;

            /**
            sorted list of Intervals, sorting them by their start property
            
            @property {SortedList(Interval)} starts
             */
            this.starts = new SortedList('start');

            /**
            sorted list of Intervals, sorting them by their end property
            
            @property {SortedList(Interval)} ends
             */
            this.ends = new SortedList('end');
        }


        /**
        the number of intervals
        
        @method count
        @return {Number}
         */

        Node.prototype.count = function () {
            return this.starts.length;
        };


        /**
        insert an interval
        
        @method insert
        @param {Interval} interval
         */

        Node.prototype.insert = function (interval) {
            this.starts.insert(interval);
            return this.ends.insert(interval);
        };


        /**
        get intervals whose start position is less than or equal to the given value
        
        @method startPointSearch
        @param {Number} val
        @return {Array(Interval)}
         */

        Node.prototype.startPointSearch = function (val) {
            var index;
            index = this.starts.lastPositionOf({
                start: val
            });
            return this.starts.slice(0, index + 1);
        };


        /**
        get intervals whose end position is more than or equal to the given value
        
        @method endPointSearch
        @param {Number} val
        @return {Array(Interval)}
         */

        Node.prototype.endPointSearch = function (val) {
            var index;
            index = this.ends.firstPositionOf({
                end: val
            });
            return this.ends.slice(index);
        };


        /**
        gets all registered interval
        
        @method getAllIntervals
        @return {Array(Interval)}
         */

        Node.prototype.getAllIntervals = function () {
            return this.starts.toArray();
        };


        /**
        remove the given interval
        
        @method remove
        @param {Interval} interval
        @param {SortedList} list
         */

        Node.prototype.remove = function (interval) {
            this.removeFromList(interval, this.starts);
            return this.removeFromList(interval, this.ends);
        };


        /**
        remove the given interval from the given list
        
        @method removeFromList
        @private
        @param {Interval} interval
        @param {SortedList} list
         */

        Node.prototype.removeFromList = function (interval, list) {
            var candidate, firstPos, i, idx, ref, ref1, results;
            firstPos = list.firstPositionOf(interval);
            results = [];
            for (idx = i = ref = firstPos, ref1 = list.length; ref <= ref1 ? i < ref1 : i > ref1; idx = ref <= ref1 ? ++i : --i) {
                candidate = list[idx];
                if (candidate.id === interval.id) {
                    list.remove(idx);
                    break;
                } else {
                    results.push(void 0);
                }
            }
            return results;
        };

        return Node;

    })();

    /**
    interval, containing start and and
    
    @class Interval
    @module interval-tree2
     */
    var Interval = (function () {

        /**
        @constructor
        @param {Number} start start of the interval
        @param {Number} end end of the interval
        @param {Number|String} id id of the interval
         */
        function Interval(start, end, id) {
            this.start = start;
            this.end = end;
            this.id = id;
        }


        /**
        get center of the interval
        
        @method center
        @return {Number} center
         */

        Interval.prototype.center = function () {
            return (this.start + this.end) / 2;
        };

        return Interval;

    })();


    /**
    interval tree

    @class IntervalTree
    @module interval-tree2
     */

    var IntervalTree = (function() {

      /**
      @constructor
      @param {Number} center center of the root node
       */
      function IntervalTree(center) {
        Util.assertNumber(center, 'IntervalTree: center');

        /**
        center => node
        
        @property {Object(Node)} nodesByCenter
         */
        this.nodesByCenter = {};

        /**
        root node
        
        @property {Node} root
         */
        this.root = this.createNode(center);

        /**
        interval id => interval
        
        @property {Object(Interval)} intervalsById
         */
        this.intervalsById = {};

        /**
        interval id => node
        
        @property {Object(Node)} nodesById
         */
        this.nodesById = {};

        /**
        sorted list of whole point
        
        @property {SortedList(Point)} pointTree
         */
        this.pointTree = new SortedList('val');

        /**
        unique id candidate of interval without id to be added next time
        
        @property {Number} idCandidate
         */
        this.idCandidate = 0;
      }


      /**
      add one interval
      
      @method add
      @public
      @param {Number} start start of the interval to create
      @param {Number} end   end of the interval to create
      @param {String|Number} [id] identifier to distinguish intervals. Automatically defiend when not set.
      @return {Interval}
       */

      IntervalTree.prototype.add = function(start, end, id) {
        var interval;
        if (this.intervalsById[id] != null) {
          throw new Error('id ' + id + ' is already registered.');
        }
        if (id == null) {
          while (this.intervalsById[this.idCandidate] != null) {
            this.idCandidate++;
          }
          id = this.idCandidate;
        }
        Util.assertNumber(start, '1st argument of IntervalTree#add()');
        Util.assertNumber(end, '2nd argument of IntervalTree#add()');
        if (start >= end) {
          Util.assertOrder(start, end, 'start', 'end');
        }
        interval = new Interval(start, end, id);
        this.pointTree.insert(new Point(interval.start, id));
        this.pointTree.insert(new Point(interval.end, id));
        this.intervalsById[id] = interval;
        return this.insert(interval, this.root);
      };


      /**
      search intervals
      when only one argument is given, return intervals which contains the value
      when two arguments are given, ...
      
      @method search
      @public
      @param {Number} val1
      @param {Number} val2
      @return {Array(Interval)} intervals
       */

      IntervalTree.prototype.search = function(val1, val2) {
        Util.assertNumber(val1, '1st argument at IntervalTree#search()');
        if (val2 == null) {
          return this.pointSearch(val1);
        } else {
          Util.assertNumber(val2, '2nd argument at IntervalTree#search()');
          Util.assertOrder(val1, val2, '1st argument', '2nd argument', 'IntervalTree#search()');
          return this.rangeSearch(val1, val2);
        }
      };


      /**
      removes an interval of the given id
      
      @method remove
      @public
      @param {Number|String} id id of the interval to remove
       */

      IntervalTree.prototype.remove = function(id) {
        var interval, node;
        interval = this.intervalsById[id];
        if (interval == null) {
          return;
        }
        node = this.nodesById[id];
        node.remove(interval);
        delete this.nodesById[id];
        return delete this.intervalsById[id];
      };


      /**
      search intervals at the given node
      
      @method pointSearch
      @public
      @param {Number} val
      @param {Node} [node] current node to search. default is this.root
      @return {Array(Interval)}
       */

      IntervalTree.prototype.pointSearch = function(val, node, results) {
        if (node == null) {
          node = this.root;
        }
        if (results == null) {
          results = [];
        }
        Util.assertNumber(val, '1st argument of IntervalTree#pointSearch()');
        if (val < node.center) {
          results = results.concat(node.startPointSearch(val));
          if (node.left != null) {
            return this.pointSearch(val, node.left, results);
          } else {
            return results;
          }
        }
        if (val > node.center) {
          results = results.concat(node.endPointSearch(val));
          if (node.right != null) {
            return this.pointSearch(val, node.right, results);
          } else {
            return results;
          }
        }
        return results.concat(node.getAllIntervals());
      };


      /**
      returns intervals which covers the given start-end interval
      
      @method rangeSearch
      @public
      @param {Number} start start of the interval
      @param {Number} end end of the interval
      @return {Array(Interval)}
       */

      IntervalTree.prototype.rangeSearch = function(start, end) {
        var firstPos, i, id, interval, j, lastPos, len, len1, point, ref, ref1, resultsById;
        Util.assertNumber(start, '1st argument at IntervalTree#rangeSearch()');
        Util.assertNumber(end, '2nd argument at IntervalTree#rangeSearch()');
        Util.assertOrder(start, end, '1st argument', '2nd argument', 'IntervalTree#rangeSearch()');
        resultsById = {};
        ref = this.pointSearch(start);
        for (i = 0, len = ref.length; i < len; i++) {
          interval = ref[i];
          resultsById[interval.id] = interval;
        }
        firstPos = this.pointTree.firstPositionOf(new Point(start));
        lastPos = this.pointTree.lastPositionOf(new Point(end));
        ref1 = this.pointTree.slice(firstPos, lastPos + 1);
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          point = ref1[j];
          resultsById[point.id] = this.intervalsById[point.id];
        }
        return (function() {
          var results1;
          results1 = [];
          for (id in resultsById) {
            interval = resultsById[id];
            results1.push(interval);
          }
          return results1;
        })();
      };


      /**
      insert interval to the given node
      
      @method insert
      @private
      @param {Interval} interval
      @param {Node} node node to insert the interval
      @return {Interval} inserted interval
       */

      IntervalTree.prototype.insert = function(interval, node) {
        if (interval.end < node.center) {
          if (node.left == null) {
            node.left = this.createNode(interval.end);
          }
          return this.insert(interval, node.left);
        }
        if (node.center < interval.start) {
          if (node.right == null) {
            node.right = this.createNode(interval.start);
          }
          return this.insert(interval, node.right);
        }
        node.insert(interval);
        this.nodesById[interval.id] = node;
        return interval;
      };


      /**
      create node by center
      
      @method createNode
      @private
      @param {Number} center
      @return {Node} node
       */

      IntervalTree.prototype.createNode = function(center) {
        var node;
        node = new Node(center);
        this.nodesByCenter[center] = node;
        return node;
      };

      return IntervalTree;

    })();

    return IntervalTree;
})();