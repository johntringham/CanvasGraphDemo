"use strict";
class Position {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    Distance(other) {
        // pythagorus
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
    }
}
class Edge {
    constructor(start, end) {
        this.length = -1; // -1 when unset - gets set by graph constructor
        this.start = start;
        this.end = end;
    }
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
//# sourceMappingURL=GraphObjects.js.map