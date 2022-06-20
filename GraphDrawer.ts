class GraphDrawer {
    canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        //this.ctx.scale(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    DrawGraph(graph: Graph) {
        let ctx = this.ctx; // hack to shut typescript up
        ctx.clearRect(0, 0, 10000, 10000);
        // drawing nodes:
        for (let node of graph.nodes) {
            console.log("drawing image");
            if (node.image.complete) { // image may not have loaded by the time we try to draw it...
                this.DrawNode(node);
            } else {
                let graphDrawer = this;
                node.image.onload = function () {
                    graphDrawer.DrawNode(node);
                };
            }
        }

        for (let edge of graph.AllEdges()) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#888888";

            ctx.moveTo(edge.start.position.x, edge.start.position.y);
            ctx.lineTo(edge.end.position.x, edge.end.position.y);
            ctx.stroke();
        }
    }

    DrawNode(node: IGraphNode) {
        let xp = node.position.x - node.image.width / 2;
        let yp = node.position.y - node.image.height / 2;
        this.ctx.drawImage(node.image, xp, yp);

        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#0000ff";
        this.ctx.fillText(node.label, node.position.x, yp);
    }
}
