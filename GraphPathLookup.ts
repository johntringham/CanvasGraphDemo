class GraphPathLookup {
    graph: Graph;

    // nextStepLookup : Map<[IGraphNode, IGraphNode], IGraphNode>;
    private nextStepLookup: Map<IGraphNode, Map<IGraphNode, IGraphNode>>;

    constructor(graph: Graph) {
        this.graph = graph;

        this.nextStepLookup = new Map<IGraphNode, Map<IGraphNode, IGraphNode>>();

        for (let node of graph.nodes) {
            this.nextStepLookup.set(node, new Map<IGraphNode, IGraphNode>());
            this.SetFirstStep(node, node, node);

            for (let connectedNode of graph.GetConnectedNodes(node)) {
                // this.nextStepLookup.set([node, connectedNode], connectedNode);
                this.SetFirstStep(node, connectedNode, connectedNode);
            }
        }

        for (let start of graph.nodes) {
            for (let end of graph.nodes) {
                if (this.GetFirstStep(start, end) == undefined) {
                    this.FindPath(start, end);
                }
            }
        }
    }

    SetFirstStep(start: IGraphNode, destination: IGraphNode, firstStep: IGraphNode) {
        this.nextStepLookup.get(start)?.set(destination, firstStep);
    }

    GetFirstStep(start: IGraphNode, destination: IGraphNode): IGraphNode | undefined {
        return this.nextStepLookup.get(start)?.get(destination);
    }

    GetPathStops(start: IGraphNode, destination: IGraphNode): IGraphNode[] {

        let path: IGraphNode[] = [];
        let currentPlace: IGraphNode | undefined = start;
        while (currentPlace != destination && currentPlace != undefined) {
            currentPlace = this.GetFirstStep(currentPlace, destination);
            if (currentPlace != undefined) {
                path.push(currentPlace);
            }
        }

        return path;
    }

    // don't use this unless you have to, use GetPathStops instead.
    GetPathEdges(start: IGraphNode, destination: IGraphNode): IEdge[] {

        let path: IEdge[] = [];
        let prevPlace = start;
        let currentPlace: IGraphNode | undefined = start;
        while (currentPlace != destination && currentPlace != undefined) {
            currentPlace = this.GetFirstStep(currentPlace, destination);
            if (currentPlace != undefined) {
                path.push(graph.GetEdge(prevPlace, currentPlace)!);

                prevPlace = currentPlace;
            }
        }

        return path;
    }

    private FindPath(start: IGraphNode, end: IGraphNode) {
        console.log("finding a path...");
        // stolen psuedocode from wikipedia
        let inf = 1000000;

        let dist = new Map<IGraphNode, number>();
        let prev = new Map<IGraphNode, IGraphNode | null>();
        let nodesToProcess: IGraphNode[] = [];
        for (var v of this.graph.nodes) {
            dist.set(v, inf);
            prev.set(v, null);
            nodesToProcess.push(v);
        }

        dist.set(start, 0);

        while (nodesToProcess.length > 0) {
            let minDist = inf;
            let closestUnprocessedNode: IGraphNode | null = null;
            for (let node of nodesToProcess) {
                let distance = dist.get(node)!;
                if (distance < minDist) {
                    closestUnprocessedNode = node;
                    minDist = distance!;
                }
            }

            let u = closestUnprocessedNode!;
            nodesToProcess.splice(nodesToProcess.indexOf(u), 1);

            let neighbours = this.graph.GetConnectedNodes(u);
            for (let neighbour of neighbours) {
                let distToU = dist.get(u)!;
                let alt = distToU + this.graph.GetEdge(u, neighbour)!.length; // not optimum but who cares
                if (alt < dist.get(neighbour)!) {
                    dist.set(neighbour, alt);
                    prev.set(neighbour, u);
                }
            }
        }

        let step = prev.get(end);
        while (step != null) {
            let previousStep = prev.get(step);
            if (previousStep != null) {
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
