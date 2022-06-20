class Position {
    x : number = 0;
    y : number = 0;

    constructor(x : number, y : number){
        this.x = x; 
        this.y = y;
    }

    Distance (other : Position) : number {
        // pythagorus
        return Math.sqrt((this.x - other.x) * (this.x - other.x) +  (this.y - other.y) * (this.y - other.y));
    }
}

interface IGraphNode {
    position : Position;
    image : HTMLImageElement;
    label : string;
}

// NOTE THAT THESE ARE DIRECTIONAL!
interface IEdge {
    start : IGraphNode;
    end : IGraphNode;
    length : number;
}

class Edge implements IEdge{
    start: IGraphNode;
    end: IGraphNode;
    length : number = -1; // -1 when unset
    constructor(start: IGraphNode, end:IGraphNode){
        this.start = start;
        this.end = end;
    }
}

class Graph {
    nodes : IGraphNode[] = [];
    private edges : IEdge[] = []; // private to discourage access, you should use GetEdge/HasEdge instead, as IEdge are implemented directionally (ie. with a 'start' and an 'end') which makes using them directly a bit annoying
    width : number;
    height : number;
    pathLookup : GraphPathLookup;

    constructor(nodes : IGraphNode[], width : number, height : number, extraEdges : number){
        this.nodes = nodes;
        this.edges = [];
        this.width = width;
        this.height = height;

        this.AddBareMinimumEdges();
        this.AddExtraEdges(extraEdges);
        this.DisperseNodes(0.05, 200000, 500, 500); // constants that fit by playing around
        this.SetEdgeDistances();
        this.pathLookup = new GraphPathLookup(this);
    }

    SetEdgeDistances(){
        for(let edge of this.edges){
            edge.length = edge.start.position.Distance(edge.end.position);
        }
    }

    HasEdge( a : IGraphNode, b : IGraphNode) : boolean {
        return this.GetEdge(a, b) != null;
    }

    AllEdges() : IEdge[] {
        return this.edges;
    }

    GetEdge( a : IGraphNode, b : IGraphNode) : IEdge | null {
        for(let edge of this.edges){
            if(edge.start == a && edge.end == b || edge.start == b && edge.end == a){
                return edge;
            }
        }

        return null;
    }

    // returns all nodes connected to node
    GetConnectedNodes(node : IGraphNode) : IGraphNode[]{
        let connectedNodes :IGraphNode[] = [];

        for(let edge of this.edges){
            if(edge.start == node){
                connectedNodes.push(edge.end);
            }
            if(edge.end == node){
                connectedNodes.push(edge.start);
            }
        }

        return connectedNodes;
    }

    DisperseNodes(attractConstant : number, repellConstant : number, borderRepell: number, iterations : number){
        // this method just pushes the position of nodes around so that they're close to other connected
        // nodes, but not overlapping or weirdly positioned. don't worry about the implementation of it, it's hacked together
        // i'd recommend leaving this method alone 
        for(let i = 0; i<iterations; i++){
            let forceLookup : Map<IGraphNode, [x : number, y:number]> = new  Map<IGraphNode, [x : number, y:number]>();
            for(let edge of this.edges){
                // attract nodes that have edges together
                let nodeForce : [x:number, y:number] = [0,0];
                let a = edge.start;
                let b = edge.end;

                let distance = a.position.Distance(b.position);
                if(distance <= 100){
                    distance = 100; // if it's lower than this when you do 1/distance it gets too big and messy
                }

                var forceMagnitude = attractConstant * (distance);
                var force : [x:number, y:number] = [forceMagnitude * (a.position.x - b.position.x) / distance, 
                            forceMagnitude * (a.position.y - b.position.y) / distance];
                nodeForce = [nodeForce[0] - force[0], nodeForce[1] - force[1]];

                let oldNodeForceA = forceLookup.get(a) ?? [0, 0];
                forceLookup.set(a, [oldNodeForceA[0] + nodeForce[0] * 0.5, oldNodeForceA[1] + nodeForce[1] * 0.5]);

                let oldNodeForceB = forceLookup.get(b) ?? [0,0];
                forceLookup.set(b, [oldNodeForceB[0] - nodeForce[0] * 0.5, oldNodeForceB[1] - nodeForce[1] * 0.5]);
            }

            for(let a of this.nodes){
                let force = forceLookup.get(a) ?? [0,0];
                a.position = new Position(a.position.x + force[0], a.position.y + force[1]);
            }
        
            //let forceLookup : Map<IGraphNode, [x : number, y:number]> = new  Map<IGraphNode, [x : number, y:number]>();

            for(let a of this.nodes){
                // repel all nodes from each other
                let nodeForce : [x:number, y:number] = [0,0];
                for(let b of this.nodes){
                    if(a == b) continue;
                    var distance = a.position.Distance(b.position);
                    var forceMagnitude = repellConstant / (distance * distance);
                    var force : [x:number, y:number] = [forceMagnitude * (a.position.x - b.position.x) / distance, 
                                forceMagnitude * (a.position.y - b.position.y) / distance];
                    nodeForce = [nodeForce[0] + force[0], nodeForce[1] + force[1]];
                }

                let leftDiff = Math.max(a.position.x, 10);
                let leftForce = 5 * borderRepell / (leftDiff);
                
                let rightDiff = Math.max(this.width - a.position.x, 10);
                let rightForce = 5 * borderRepell / (rightDiff);

                let upDiff = Math.max(a.position.y, 10);
                let upForce = 5 *  borderRepell / (upDiff);
                
                let downDiff = Math.max(this.height - a.position.y, 10);
                let downForce = 5 * borderRepell / (downDiff);

                nodeForce = [nodeForce[0] + (leftForce - rightForce), nodeForce[1] + (upForce - downForce)];

                forceLookup.set(a, nodeForce);
            }

            for(let a of this.nodes){
                let force = forceLookup.get(a)!;
                force[0] = clamp(force[0], -10, 10);
                force[1] = clamp(force[1], -10, 10);
                a.position = new Position(a.position.x + force[0], a.position.y + force[1]);
            }
        }
    }

    AddBareMinimumEdges(){
        // prims algorithm
        // This adds edges so that theres the minimum amount of edges to make the graph fully connected
        // tso that there's always a path from one place to another. but it leads to boring maps, so call
        // AddExtraEdges as well.
        let inTree : IGraphNode[] = [];
        let notInTree : IGraphNode[] = [...this.nodes]; // copying so we don't delete nodes accidentally

        // move first node into the tree
        inTree.push(notInTree[0]);
        notInTree.splice(0, 1);

        while(notInTree.length > 0){
            
            let bestDistance = 10000000;
            let bestPair : IGraphNode[] | null = null;
            for(let a of inTree){
                for(let b of notInTree){
                    var distance = a.position.Distance(b.position);
                    if(distance < bestDistance){
                        bestPair = [a, b];
                        bestDistance = distance;
                    }
                }
            }

            if(bestPair != null){
                notInTree.splice(notInTree.indexOf(bestPair[1]), 1);
                inTree.push(bestPair[1]);
                this.edges.push(new Edge(bestPair[0], bestPair[1]));
            }
        }
    }

    AddExtraEdges(count : number){
        for(let i = 0; i< count; i++){
            let randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];

            let bestDistance = 10000000;
            let bestPair : IGraphNode[] | null = null;
            
            for(let otherNode of this.nodes){
                if(otherNode == randomNode) { continue; }
                var distance = randomNode.position.Distance(otherNode.position);
                if(distance < bestDistance && !this.HasEdge(randomNode, otherNode)){
                    bestPair = [randomNode, otherNode];
                    bestDistance = distance;
                }
            }
            if(bestPair != null){
                this.edges.push(new Edge(bestPair[0], bestPair[1]));
            }
        }
    }
}

class GraphPathLookup {
    graph : Graph;

    // nextStepLookup : Map<[IGraphNode, IGraphNode], IGraphNode>;
    private nextStepLookup : Map<IGraphNode, Map<IGraphNode, IGraphNode>>;

    constructor(graph : Graph){
        this.graph = graph;

        this.nextStepLookup = new Map<IGraphNode, Map<IGraphNode, IGraphNode>>();

        for(let node of graph.nodes){
            this.nextStepLookup.set(node, new Map<IGraphNode, IGraphNode>());
            this.SetFirstStep(node, node, node);

            for(let connectedNode of graph.GetConnectedNodes(node)){
                // this.nextStepLookup.set([node, connectedNode], connectedNode);
                this.SetFirstStep(node, connectedNode, connectedNode);
            }
        }

        for(let start of graph.nodes){
            for(let end of graph.nodes){
                if(this.GetFirstStep(start,end) == undefined)
                {
                    this.FindPath(start, end);
                }
            }
        }
    }

    SetFirstStep(start : IGraphNode, destination: IGraphNode, firstStep: IGraphNode){
        this.nextStepLookup.get(start)?.set(destination, firstStep);
    }

    GetFirstStep(start : IGraphNode, destination: IGraphNode) : IGraphNode | undefined{
        return this.nextStepLookup.get(start)?.get(destination);
    }

    GetPath(start: IGraphNode, destination: IGraphNode) : IGraphNode[]{

        let path :IGraphNode[] = [];
        let currentPlace : IGraphNode | undefined = start;
        while(currentPlace != destination && currentPlace != undefined)
        {
            currentPlace = this.GetFirstStep(currentPlace, destination);
            if(currentPlace != undefined){
                path.push(currentPlace);
            }
        }

        return path;
    }

    private FindPath(start: IGraphNode, end : IGraphNode){
        console.log("finding a path...");
      // stolen psuedocode from wikipedia
        let inf = 1000000;

        let dist = new Map<IGraphNode, number>();
        let prev = new Map<IGraphNode, IGraphNode | null>();
        let nodesToProcess : IGraphNode[] = [];
        for(var v of this.graph.nodes){
            dist.set(v, inf);
            prev.set(v, null);
            nodesToProcess.push(v);
        }

        dist.set(start, 0);
      
      while (nodesToProcess.length > 0){
        let minDist = inf;
        let closestUnprocessedNode : IGraphNode | null = null;
        for(let node of nodesToProcess){
            let distance = dist.get(node)!;
            if(distance < minDist){
                closestUnprocessedNode = node;
                minDist = distance!;
            }
        }

          let u = closestUnprocessedNode!;
          nodesToProcess.splice(nodesToProcess.indexOf(u), 1); 
          
          let neighbours = this.graph.GetConnectedNodes(u);
          for (let neighbour of neighbours){
            let distToU = dist.get(u)!;
            let alt = distToU + this.graph.GetEdge(u, neighbour)!.length; // not optimum but who cares
            if(alt < dist.get(neighbour)!){
                dist.set(neighbour, alt);
                prev.set(neighbour, u);
            }
          }
      }

      let step = prev.get(end);
      while(step != null){
        let previousStep = prev.get(step);
        if(previousStep != null){
            // this.nextStepLookup.set([previousStep, end], step);
            this.SetFirstStep(previousStep, end, step);
        }

        step = previousStep;
      }

    //   for(let element of prev){

    //     this.nextStepLookup.set()
    //   }
    }
}

class GraphDrawer
{
    canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    constructor(canvas : HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        //this.ctx.scale(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    DrawGraph(graph : Graph){
        let ctx = this.ctx; // hack to shut typescript up
        ctx.clearRect(0, 0, 10000, 10000);
        // drawing nodes:
        for (let node of graph.nodes){
            console.log("drawing image");
            if(node.image.complete){ // image may not have loaded by the time we try to draw it...
                this.DrawNode(node);
            }else{
                let graphDrawer = this;
                node.image.onload = function (){
                    graphDrawer.DrawNode(node);
                }
            }
        }

        for(let edge of graph.AllEdges()){
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#888888";

            ctx.moveTo(edge.start.position.x, edge.start.position.y);
            ctx.lineTo(edge.end.position.x, edge.end.position.y);
            ctx.stroke();
        }
    }

    DrawNode(node : IGraphNode){
        let xp = node.position.x - node.image.width / 2;
        let yp = node.position.y - node.image.height / 2;
        this.ctx.drawImage(node.image, xp, yp);
        
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#0000ff";
        this.ctx.fillText(node.label, node.position.x, yp);
    }
}

const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max);