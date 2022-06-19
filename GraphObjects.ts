class Position {
    x : number = 0;
    y : number = 0;

    constructor(x : number, y : number){
        this.x = x; 
        this.y = y;
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

class Graph {
    nodes : IGraphNode[] = [];
    edges : IEdge[] = [];

    constructor(nodes : IGraphNode[], edges : IEdge[]){
        this.nodes = nodes;
        this.edges = edges;
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

        for (let node of graph.nodes){
            console.log("drawing image");
            if(node.image.complete){ // image may not have loaded by the time we try to draw it...
                ctx.drawImage(node.image, node.position.x, node.position.y);
            }else{
                node.image.onload = function (){
                    ctx.drawImage(node.image, node.position.x, node.position.y);
                }
            }
        }
    }
}