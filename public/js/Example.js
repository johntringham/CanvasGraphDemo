"use strict";
var count = 0;
class House {
    constructor(position) {
        this.position = position;
        this.label = "house " + (count++).toString();
        this.image = new Image();
        this.image.src = "./images/house.png";
    }
}
class Work {
    constructor(position) {
        this.position = position;
        this.label = "work " + (count++).toString();
        this.image = new Image();
        this.image.src = "./images/work.png";
    }
}
class HousesAndWorkGraph extends Graph {
    constructor(width, height, nodeCount) {
        let nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            // initial position is random - each node needs to set it's position to something initially.
            // Once the super constructor is called the actual positions will be moved about (in DisperseNodes()) so it creates a much nicer looking graph.
            let px = Math.random() * width;
            let py = Math.random() * height;
            let position = new Position(px, py);
            // 75% chance of a house, 25% of work
            // change this logic for whatever distribution of nodes you want
            if (Math.random() < 0.75) {
                let house = new House(position);
                nodes.push(house);
            }
            else {
                let work = new Work(position);
                nodes.push(work);
            }
        }
        super(nodes, width, height, 10); // 10 is the number of 'extra' edges - increase to make graph more connected, reduce to make it more linear.
    }
}
var graph = new HousesAndWorkGraph(1000, 1000, 20);
var canvas = document.getElementById("graphCanvas");
var graphDrawer = new GraphDrawer(canvas);
graphDrawer.DrawGraph(graph);
// pathfinding demo
let start = graph.nodes[0];
let end = graph.nodes[graph.nodes.length - 1];
let path = graph.pathLookup.GetPathStops(start, end);
console.log(`Shortest path from ${start.label} to ${end.label} is: `);
for (let stop of path) {
    console.log(` -> ${stop.label}, (at position ${stop.position.x}, ${stop.position.y})`);
}
//# sourceMappingURL=Example.js.map