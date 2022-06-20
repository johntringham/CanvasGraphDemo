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
    length : number = -1; // -1 when unset - gets set by graph constructor
    constructor(start: IGraphNode, end:IGraphNode){
        this.start = start;
        this.end = end;
    }
}

const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max);