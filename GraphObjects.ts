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

interface IEdge {
    start : IGraphNode;
    end : IGraphNode;
}

class Edge implements IEdge{
    start: IGraphNode;
    end: IGraphNode;
    constructor(start: IGraphNode, end:IGraphNode){
        this.start = start;
        this.end = end;
    }
}

class Graph {
    nodes : IGraphNode[] = [];
    edges : IEdge[] = [];
    width : number;
    height : number;

    constructor(nodes : IGraphNode[], edges : IEdge[], width : number, height : number){
        this.nodes = nodes;
        this.edges = edges;
        this.width = width;
        this.height = height;
    }

    HasEdge( a : IGraphNode, b : IGraphNode) : boolean {
        return this.GetEdge(a, b) != null;
    }

    GetEdge( a : IGraphNode, b : IGraphNode) : IEdge | null {
        for(let edge of this.edges){
            if(edge.start == a && edge.end == b || edge.start == b && edge.end == a){
                return edge;
            }
        }

        return null;
    }

    DisperseNodes(attractConstant : number, repellConstant : number, borderRepell: number, iterations : number){
        // this method just pushes the position of nodes around so that they're close to other connected
        // nodes, but not overlapping or weirdly positioned. don't worry about the implementation of it, it's hacked together
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
        // This adds edges so that theres the minimum amount of edges to make the graph fully connected
        // tso that there's always a path from one place to another. but it leads to boring maps, so call
        // addBonusEdges as well.
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
                
                ctx.drawImage(node.image, node.position.x - node.image.width / 2, node.position.y - node.image.width / 2);
            }else{
                node.image.onload = function (){
                    ctx.drawImage(node.image, node.position.x - node.image.width / 2, node.position.y - node.image.width / 2);
                }
            }
        }

        for(let edge of graph.edges){
            ctx.beginPath();
            ctx.moveTo(edge.start.position.x, edge.start.position.y);
            ctx.lineTo(edge.end.position.x, edge.end.position.y);
            ctx.stroke();
        }
    }
}

const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max);