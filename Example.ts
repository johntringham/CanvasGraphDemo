
class House implements IGraphNode {
    position : Position;
    image : HTMLImageElement;
    label : string;

    constructor(position : Position){
        this.position = position;
        this.label = "house";
        this.image = new Image();
        this.image.src = "./images/house.png";
    }
}

class Work implements IGraphNode {
    position : Position;
    image : HTMLImageElement;
    label : string;

    constructor(position : Position){
        this.position = position;
        this.label = "work";
        this.image = new Image();
        this.image.src = "./images/work.png";
    }
}

class HousesAndWorkGraph extends Graph
{
    constructor(width : number, height: number, rows : number, columns: number, wiggle:number, connectedness:number)
    {
        // basic idea of this method is to create a bunch of nodes that are on a grid, but to push them about a bit (the wiggle factor)
        // using a grid as a starting point and then doing small wiggles means they don't get bunched up or overlap
        let columnWidth = width/(columns + 1);
        let rowHeight = height/(rows + 1);

        let nodes : IGraphNode[] = [];

        for(let x = 0; x < columns; x++){
            for(let y = 0; y < rows; y++){

                let wx = Math.random() * wiggle + 0.5;
                let wy = Math.random() * wiggle + 0.5;

                let position = new Position(columnWidth * (x + wx), rowHeight * (y + wy));

                // 50% of a house, 25% of work, 25% of nothing
                // change this logic for whatever distribution of nodes you want
                if(Math.random() < 0.5){
                    let house = new House(position);
                    nodes.push(house);
                } 
                else if(Math.random() < 0.5){
                    let work = new Work(position);
                    nodes.push(work);
                }
            }
        }
        
        super(nodes, [], width, height);
        this.AddBareMinimumEdges();
        this.AddExtraEdges(10);
        this.DisperseNodes(0.05, 200000, 500, 500);
    }
}

var graph = new HousesAndWorkGraph(1000, 1000, 6, 6, 0.8, 0);

var canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;

var graphDrawer = new GraphDrawer(canvas);
graphDrawer.DrawGraph(graph);

// setInterval(function () {
//     graph.DisperseNodes(0.05, 200000, 500, 1);
//     graphDrawer.DrawGraph(graph);
// }, 100);