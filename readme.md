# Basic graph drawing for html canvas in typescript

Code is a bit hacky.

See example.ts for an example usage, and see http://graph-drawing-demo.surge.sh/public/ for a live demo of that example code.

What it does:

- Basic objectmodel for graph theory stuff (edges, nodes)
- `Graph` constructor automatically does Prim's algorithm to make a minimum spanning tree, but you can pass through how many 'extra' edges to add (to make it a less boring graph)
- Some 'vertex-dispersal' algorithm I made up to make sure the nodes aren't bunched up, but also aren't far away of stuck at the edges of the screen. It's not perfect but it works pretty well for graphs that have about 20-80 vertices.
- Basic baked pathfinding - shortest paths between any two pairs of nodes is calculated during construction so pathfinding after that is fast. See example.ts for details

Note:
- It does use Math.random, so if you want to be able to give it a set seed then you'll need to replace those (in example.ts, and in `AddExtraEdges` in graph.ts).
- `IEdge` is directional (as it it's implemented with a start property and an end property), which was a bit of an oversight. This is annoying because if you're looking for an edge that starts at A and ends at B, you might overlook the edge that starts at B and ends at A.
    - To avoid this problem, try to avoid using the `edges` field in `graph` - use the helper methods instead (`GetConnectedNodes`, `HasEdge`, `GetEdge`, etc) which check forward and backwards facing edges
    - You could probably get around this problem by changing the implementation of edge to something like an array or a set or something, but it's probably not worth the time