"use strict";
class Graph {
    constructor(nodes, width, height, extraEdges) {
        this.nodes = [];
        this.edges = []; // private to discourage direct access, 
        this.nodes = nodes;
        this.edges = [];
        this.width = width;
        this.height = height;
        this.AddBareMinimumEdges();
        this.AddExtraEdges(extraEdges);
        this.DisperseNodes(0.05, 200000, 500, 500); // constants that fit by playing around - i'd leave these as-is
        this.SetEdgeDistances();
        this.pathLookup = new GraphPathLookup(this);
    }
    SetEdgeDistances() {
        for (let edge of this.edges) {
            edge.length = edge.start.position.Distance(edge.end.position);
        }
    }
    HasEdge(a, b) {
        return this.GetEdge(a, b) != null;
    }
    AllEdges() {
        return this.edges;
    }
    GetEdge(a, b) {
        for (let edge of this.edges) {
            if (edge.start == a && edge.end == b || edge.start == b && edge.end == a) {
                return edge;
            }
        }
        return null;
    }
    // returns all nodes connected to node
    GetConnectedNodes(node) {
        let connectedNodes = [];
        for (let edge of this.edges) {
            if (edge.start == node) {
                connectedNodes.push(edge.end);
            }
            if (edge.end == node) {
                connectedNodes.push(edge.start);
            }
        }
        return connectedNodes;
    }
    DisperseNodes(attractConstant, repellConstant, borderRepell, iterations) {
        var _a, _b, _c;
        // this method just pushes the position of nodes around so that they're close to other connected
        // nodes, but not overlapping or weirdly positioned. don't worry about the implementation of it, it's hacked together
        // i'd recommend leaving this method alone 
        for (let i = 0; i < iterations; i++) {
            let forceLookup = new Map();
            for (let edge of this.edges) {
                // attract nodes that have edges together
                let nodeForce = [0, 0];
                let a = edge.start;
                let b = edge.end;
                let distance = a.position.Distance(b.position);
                if (distance <= 100) {
                    distance = 100; // if it's lower than this when you do 1/distance it gets too big and messy
                }
                var forceMagnitude = attractConstant * (distance);
                var force = [forceMagnitude * (a.position.x - b.position.x) / distance,
                    forceMagnitude * (a.position.y - b.position.y) / distance];
                nodeForce = [nodeForce[0] - force[0], nodeForce[1] - force[1]];
                let oldNodeForceA = (_a = forceLookup.get(a)) !== null && _a !== void 0 ? _a : [0, 0];
                forceLookup.set(a, [oldNodeForceA[0] + nodeForce[0] * 0.5, oldNodeForceA[1] + nodeForce[1] * 0.5]);
                let oldNodeForceB = (_b = forceLookup.get(b)) !== null && _b !== void 0 ? _b : [0, 0];
                forceLookup.set(b, [oldNodeForceB[0] - nodeForce[0] * 0.5, oldNodeForceB[1] - nodeForce[1] * 0.5]);
            }
            for (let a of this.nodes) {
                let force = (_c = forceLookup.get(a)) !== null && _c !== void 0 ? _c : [0, 0];
                a.position = new Position(a.position.x + force[0], a.position.y + force[1]);
            }
            //let forceLookup : Map<IGraphNode, [x : number, y:number]> = new  Map<IGraphNode, [x : number, y:number]>();
            for (let a of this.nodes) {
                // repel all nodes from each other
                let nodeForce = [0, 0];
                for (let b of this.nodes) {
                    if (a == b)
                        continue;
                    var distance = a.position.Distance(b.position);
                    var forceMagnitude = repellConstant / (distance * distance);
                    var force = [forceMagnitude * (a.position.x - b.position.x) / distance,
                        forceMagnitude * (a.position.y - b.position.y) / distance];
                    nodeForce = [nodeForce[0] + force[0], nodeForce[1] + force[1]];
                }
                let leftDiff = Math.max(a.position.x, 10);
                let leftForce = 5 * borderRepell / (leftDiff);
                let rightDiff = Math.max(this.width - a.position.x, 10);
                let rightForce = 5 * borderRepell / (rightDiff);
                let upDiff = Math.max(a.position.y, 10);
                let upForce = 5 * borderRepell / (upDiff);
                let downDiff = Math.max(this.height - a.position.y, 10);
                let downForce = 5 * borderRepell / (downDiff);
                nodeForce = [nodeForce[0] + (leftForce - rightForce), nodeForce[1] + (upForce - downForce)];
                forceLookup.set(a, nodeForce);
            }
            for (let a of this.nodes) {
                let force = forceLookup.get(a);
                force[0] = clamp(force[0], -10, 10);
                force[1] = clamp(force[1], -10, 10);
                a.position = new Position(a.position.x + force[0], a.position.y + force[1]);
            }
        }
    }
    AddBareMinimumEdges() {
        // Prims algorithm
        // This adds edges so that theres the minimum amount of edges to make the graph fully connected
        // tso that there's always a path from one place to another. but it leads to boring maps, so call
        // AddExtraEdges as well.
        let inTree = [];
        let notInTree = [...this.nodes]; // copying so we don't delete nodes accidentally
        // move first node into the tree
        inTree.push(notInTree[0]);
        notInTree.splice(0, 1);
        while (notInTree.length > 0) {
            let bestDistance = 10000000;
            let bestPair = null;
            for (let a of inTree) {
                for (let b of notInTree) {
                    var distance = a.position.Distance(b.position);
                    if (distance < bestDistance) {
                        bestPair = [a, b];
                        bestDistance = distance;
                    }
                }
            }
            if (bestPair != null) {
                notInTree.splice(notInTree.indexOf(bestPair[1]), 1);
                inTree.push(bestPair[1]);
                this.edges.push(new Edge(bestPair[0], bestPair[1]));
            }
        }
    }
    AddExtraEdges(count) {
        // adds a random edges between unconnected nodes
        for (let i = 0; i < count; i++) {
            let randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            let bestDistance = 10000000;
            let bestPair = null;
            for (let otherNode of this.nodes) {
                if (otherNode == randomNode) {
                    continue;
                }
                var distance = randomNode.position.Distance(otherNode.position);
                if (distance < bestDistance && !this.HasEdge(randomNode, otherNode)) {
                    bestPair = [randomNode, otherNode];
                    bestDistance = distance;
                }
            }
            if (bestPair != null) {
                this.edges.push(new Edge(bestPair[0], bestPair[1]));
            }
        }
    }
}
//# sourceMappingURL=Graph.js.map