
var count = 0;


class House implements IGraphNode {
    position : Position;
    image : HTMLImageElement;
    label : string;

    constructor(position : Position){
        this.position = position;
        this.label = "house " + (count ++).toString();
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
        this.label = "work " + (count ++).toString();
        this.image = new Image();
        this.image.src = "./images/work.png";
    }
}


class HousesAndWorkGraph extends Graph
{
    constructor(width : number, height: number, rows : number, columns: number)
    {
        // basic idea of this method is to create a bunch of nodes that are on a grid, but to push them about a bit (the wiggle factor)
        // using a grid as a starting point and then doing small wiggles means they don't get too bunched up or overlap
        let columnWidth = width/(columns + 1);
        let rowHeight = height/(rows + 1);

        let nodes : IGraphNode[] = [];
        let wiggle = 0.8;

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
                } else if(Math.random() < 0.5){
                    let work = new Work(position);
                    nodes.push(work);
                }
            }
        }
        
        super(nodes, width, height, 10);
    }
}

var graph = new HousesAndWorkGraph(1000, 1000, 6, 6);

var canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;

var graphDrawer = new GraphDrawer(canvas);
graphDrawer.DrawGraph(graph);


let start = graph.nodes[0];
let end = graph.nodes[graph.nodes.length - 1];

let path = graph.pathLookup.GetPathStops(start, end);
console.log("Shortest path from " + start.label + " to " + end.label + " is: ");
for(let stop of path){
    console.log(" -> " + stop.label);
}