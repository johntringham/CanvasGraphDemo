"use strict";
class Position {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
}
class Graph {
    constructor(nodes, edges) {
        this.nodes = [];
        this.edges = [];
        this.nodes = nodes;
        this.edges = edges;
    }
}
class GraphDrawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        //this.ctx.scale(this.canvas.clientWidth, this.canvas.clientHeight);
    }
    DrawGraph(graph) {
        let ctx = this.ctx; // hack to shut typescript up
        for (let node of graph.nodes) {
            console.log("drawing image");
            if (node.image.complete) { // image may not have loaded by the time we try to draw it...
                ctx.drawImage(node.image, node.position.x, node.position.y);
            }
            else {
                node.image.onload = function () {
                    ctx.drawImage(node.image, node.position.x, node.position.y);
                };
            }
        }
    }
}
//# sourceMappingURL=GraphObjects.js.map