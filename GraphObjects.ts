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

    constructor(nodes : IGraphNode[], edges : IEdge[]){
        this.nodes = nodes;
        this.edges = edges;
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

    DoPrimsAlgorithm(){
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

    AddBonusEdges(count : number){
        for(let i = 0; i< count; i++){
            let randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];

            let bestDistance = 10000000;
            let bestPair : IGraphNode[] | null = null;
            
            for(let otherNode of this.nodes){
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
            ctx.moveTo(edge.start.position.x, edge.start.position.y);
            ctx.lineTo(edge.end.position.x, edge.end.position.y);
            ctx.stroke();
        }
    }
}