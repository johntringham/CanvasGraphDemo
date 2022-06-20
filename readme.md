# Basic graph drawing for html canvas in typescript

Code is a bit hacky.

See example.ts for an example usage, and see http://graph-drawing-demo.surge.sh/public/ for a live demo of that example code.

What it does:

- Basic objectmodel for graph theory stuff (edges, nodes)
- `Graph` constructor automatically does Prim's algorithm to make a minimum spanning tree, but you can pass through how many 'extra' edges to add (to make it a less boring graph)
- Some 'vertex-dispersal' algorithm I made up to make sure the nodes aren't bunched up, but also aren't far away of stuck at the edges of the screen. It's not perfect but it works pretty well for graphs that have about 20-80 vertices.
- Basic baked pathfinding - shortest paths between any two pairs of nodes is calculated during construction so pathfinding after that is fast. See example.ts for details
